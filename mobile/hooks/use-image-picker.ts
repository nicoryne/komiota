import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { Alert } from 'react-native';

export function useImagePicker() {
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async (
    options: ImagePicker.ImagePickerOptions = {}
  ): Promise<string | null> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow photo access in your settings to use images.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      ...options,
    });

    if (result.canceled || !result.assets.length) {
      return null;
    }

    const asset = result.assets[0];

    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      Alert.alert('File Too Large', 'Please select an image smaller than 10MB.');
      return null;
    }

    const isGif =
      asset.uri.toLowerCase().endsWith('.gif') ||
      asset.mimeType === 'image/gif' ||
      asset.fileName?.toLowerCase().endsWith('.gif');

    if (isGif) {
      Alert.alert('Invalid Format', 'GIFs and animated images are not allowed. Please select a static image like JPEG, PNG, or WEBP.');
      return null;
    }

    return asset.uri;
  };

  const uploadImage = async (
    imageUri: string,
    folder: string = 'general'
  ): Promise<string | null> => {
    setIsUploading(true);
    let remoteUrl: string | null = null;

    try {
      remoteUrl = await uploadImageToCloudinary(imageUri, folder);

      if (!remoteUrl) {
        throw new Error('Cloudinary returned an empty response.');
      }
    } catch (e: any) {
      console.error('Image upload failed:', e);
      Alert.alert('Upload Failed', e.message || 'There was an issue uploading your image. Please try again.');
    } finally {
      setIsUploading(false);
    }

    return remoteUrl;
  };

  const pickAndUploadImage = async (
    options: ImagePicker.ImagePickerOptions = {},
    folder: string = 'general'
  ): Promise<string | null> => {
    const uri = await pickImage(options);
    if (!uri) return null;
    return await uploadImage(uri, folder);
  };

  return { pickImage, uploadImage, pickAndUploadImage, isUploading };
}
