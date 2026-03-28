import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Keyboard, ActivityIndicator, Alert, Image } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useImagePicker } from '@/hooks/use-image-picker';
import { submitBusStop } from '@/services/bus-stops';

interface AddBusStopBottomSheetProps {
  coordinate: number[] | null; // [longitude, latitude]
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBusStopBottomSheet({ coordinate, onClose, onSuccess }: AddBusStopBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['50%'].map(point => (typeof point === 'string' ? point : point));

  const [stopName, setStopName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLocalUri, setImageLocalUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pickImage, uploadImage, isUploading: isImageUploading } = useImagePicker();

  const handleAddPhoto = async () => {
    const localUri = await pickImage({ allowsEditing: true, quality: 0.6 });
    if (localUri) {
      setImageLocalUri(localUri);
      setImageUrl(null);
    }
  };

  const handleCropPhoto = async () => {
    const localUri = await pickImage({ allowsEditing: true, quality: 0.6 });
    if (localUri) {
      setImageLocalUri(localUri);
      setImageUrl(null);
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl(null);
    setImageLocalUri(null);
  };

  // Focus the input slightly after the bottom sheet opens to avoid animation stutter
  const inputRef = useRef<any>(null);
  useEffect(() => {
    if (coordinate) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [coordinate]);

  // Close keyboard should snap sheet down to initial index
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(0);
    });

    return () => subscription.remove();
  }, []);

  const previewUri = imageUrl || imageLocalUri;

  const closeWithoutConfirm = () => {
    setStopName('');
    setImageUrl(null);
    setImageLocalUri(null);
    onClose();
  };

  const requestClose = () => {
    if (previewUri || stopName.trim()) {
      Alert.alert(
        'Discard changes?',
        'You have an attached image or filled text. Close without saving?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              bottomSheetRef.current?.close();
            },
          },
        ]
      );
    } else {
      bottomSheetRef.current?.close();
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!coordinate) return null;

  const handleSubmit = async () => {
    if (!stopName.trim()) {
      Alert.alert('Required', 'Please enter a name for the bus stop.');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to add a bus stop.');
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const isPrivileged = profile?.role === 'admin' || profile?.role === 'moderator';
      const status = isPrivileged ? 'approved' : 'pending';

      let finalImageUrl = imageUrl;
      if (imageLocalUri && !finalImageUrl) {
        finalImageUrl = await uploadImage(imageLocalUri, 'bus_stops');

        if (!finalImageUrl) {
          throw new Error('Image upload failed. Please try again.');
        }

        setImageUrl(finalImageUrl);
      }

      await submitBusStop({
        name: stopName.trim(),
        longitude: coordinate[0],
        latitude: coordinate[1],
        image_url: finalImageUrl,
        created_by: user.id,
        status,
      });

      Alert.alert(
        'Success',
        isPrivileged 
          ? 'Bus stop has been successfully added to the map!'
          : 'Bus stop submitted! It will appear on the map once verified by a moderator.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit the bus stop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['50%']}
      enablePanDownToClose={false}
      android_keyboardInputMode="adjustResize"
      onClose={closeWithoutConfirm}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db' }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-2">
          <View className="w-12 h-12 rounded-full bg-primary/15 items-center justify-center mr-4">
            <Ionicons name="location" size={24} color={colors.primary.DEFAULT} />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="text-xl font-bold">
              Add Bus Stop
            </Text>
            <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted }} className="text-sm mt-1">
              Pin Location: {coordinate[1].toFixed(5)}, {coordinate[0].toFixed(5)}
            </Text>
          </View>
        </View>

        {/* Input */}
        <View 
          className="flex-row items-center rounded-xl px-4 py-3 mb-6"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <BottomSheetTextInput
            ref={inputRef}
            style={{ 
              flex: 1, 
              fontSize: 16, 
              marginLeft: 8,
              color: isDark ? colors.text.dark : colors.text.DEFAULT 
            }}
            placeholder="e.g., Ayala Center Terminal"
            placeholderTextColor={isDark ? colors.text.darkMuted : colors.text.muted}
            value={stopName}
            onChangeText={setStopName}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isSubmitting}
          />
        </View>

        {/* Photo Attachment */}
        <View className="mb-6">
          <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="font-semibold text-sm mb-3">
            Attach Reference Photo
          </Text>

          {previewUri ? (
            <View className="mb-4">
              <Image
                source={{ uri: previewUri }}
                style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 10 }}
                resizeMode="cover"
              />

              <View className="flex-row justify-between">
                <Pressable
                  onPress={handleCropPhoto}
                  disabled={isImageUploading || isSubmitting}
                  className="flex-1 rounded-xl py-2.5 items-center justify-center mr-2"
                  style={{ backgroundColor: colors.primary.DEFAULT }}
                >
                  <Text className="text-white font-bold">Crop/Replace</Text>
                </Pressable>

                <Pressable
                  onPress={handleRemovePhoto}
                  disabled={isImageUploading || isSubmitting}
                  className="flex-1 rounded-xl py-2.5 items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
                >
                  <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="font-semibold">Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleAddPhoto}
              disabled={isImageUploading || isSubmitting}
              className="flex-row items-center px-4 py-2.5 rounded-lg"
              style={{ backgroundColor: colors.primary.DEFAULT + '15' }}
            >
              {isImageUploading ? (
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              ) : (
                <>
                  <Ionicons name="camera" size={16} color={colors.primary.DEFAULT} />
                  <Text style={{ color: colors.primary.DEFAULT }} className="font-bold text-sm ml-2">Add Photo</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={requestClose}
            className="flex-1 rounded-xl py-3.5 items-center justify-center"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
            disabled={isSubmitting}
          >
            <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="text-base font-semibold">
              Cancel
            </Text>
          </Pressable>
          
          <Pressable
            onPress={handleSubmit}
            className="flex-1 rounded-xl py-3.5 items-center justify-center flex-row"
            style={{
              backgroundColor: isSubmitting ? colors.primary.DEFAULT + '80' : colors.primary.DEFAULT,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white text-base font-bold ml-2">
                  {isImageUploading ? 'Uploading image...' : 'Submitting...'}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-base font-bold mr-2">Submit Stop</Text>
                {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
                  <Ionicons name="shield-checkmark" size={16} color="#fff" />
                )}
              </>
            )}
          </Pressable>
        </View>

        {/* Padding buffer to prevent awkward empty space during abrupt keyboard dismissal */}
        <View style={{ height: 400 }} />
      </BottomSheetView>
    </BottomSheet>
  );
}
