import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background relative">
      {/* Top Purple Section */}
      <View className="absolute top-0 left-0 right-0 h-[65%] bg-primary rounded-b-[60px] items-center pt-32 px-8">
        {/* Placeholder for Komiota Graphic */}
        <View className="w-24 h-24 bg-white/20 rounded-3xl mb-8 items-center justify-center border-2 border-white/30">
            <Text className="text-white font-extrabold text-4xl">K</Text>
        </View>
        <Text className="text-white text-3xl font-extrabold text-center mb-4 tracking-tight">
          Welcome back!
        </Text>
        <Text className="text-white/80 text-base text-center max-w-xs leading-relaxed">
          Navigate Cebu City's BRT offline. Find routes and track stops without mobile data.
        </Text>
      </View>

      {/* Bottom White Card */}
      <View className="absolute bottom-0 left-0 right-0 h-[45%] bg-card rounded-t-[40px] px-8 pt-10 pb-16 justify-between shadow-2xl">
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Ready to commute?
          </Text>
          <Text className="text-gray-500 text-center mb-8 px-4">
            Join the community and help update bus stop statuses in real-time.
          </Text>

          {/* Pagination Indicators */}
          <View className="flex-row items-center justify-center space-x-2 mb-8">
            <View className="w-6 h-1.5 bg-primary rounded-full" />
            <View className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <View className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          </View>
        </View>

        <Pressable
          onPress={() => router.replace('/(tabs)')}
          className="bg-primary w-full py-4 rounded-full items-center shadow-md active:opacity-80"
        >
          <Text className="text-white font-bold text-lg">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
