import '../../global.css';
import { AppThemeProvider } from '@/components/ui/theme-provider';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSessionStore } from '@package/shared';
import { restoreMobileSession } from '@/features/auth/services/session';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1 } },
      }),
  );

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => resolve(null), 5000);
    });

    // Never hold the UI in a permanent loading state if storage fails/hangs.
    void Promise.race([restoreMobileSession(), timeout])
      .then((user) => {
        if (!active) return;
        if (user) useSessionStore.getState().setUser(user);
        else useSessionStore.getState().clear();
      })
      .catch((error) => {
        console.error('[RentalOS] Restore session failed', error);
        if (active) useSessionStore.getState().clear();
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
