import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSessionStore } from '@package/shared';
import { useThemeColors } from '@/components/ui/theme';

export default function AuthLayout() {
  const colors = useThemeColors();
  const status = useSessionStore((state) => state.status);
  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (status === 'authenticated') return <Redirect href="/(app)/(tabs)/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
