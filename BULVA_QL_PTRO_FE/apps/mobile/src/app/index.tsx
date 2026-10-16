import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSessionStore } from '@package/shared';
import { useThemeColors } from '@/components/ui/theme';

/** Single owner of the "/" URL: no duplicate route-group index files. */
export default function Index() {
  const colors = useThemeColors();
  const status = useSessionStore((state) => state.status);
  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <Redirect href={status === 'authenticated' ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />
  );
}
