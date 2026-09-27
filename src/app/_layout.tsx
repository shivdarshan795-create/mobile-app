import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect, type ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { DatabaseProvider } from '@/db/provider';
import { ThemePreferenceProvider } from '@/hooks/use-theme-preference';
import { useResolvedColorScheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

/** Hides the native splash once the session check resolves. Until then it stays up, covering any
 * transient/incorrect Stack.Protected guard state from the initial (user=null, isLoading=true) render. */
function SplashScreenController() {
  const { isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);
  return null;
}

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user && user.onboardingComplete}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !user.onboardingComplete}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function ResolvedThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useResolvedColorScheme();
  return <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  return (
    <Suspense fallback={null}>
      <DatabaseProvider>
        <AuthProvider>
          <ThemePreferenceProvider>
            <ResolvedThemeProvider>
              <SplashScreenController />
              <RootNavigator />
            </ResolvedThemeProvider>
          </ThemePreferenceProvider>
        </AuthProvider>
      </DatabaseProvider>
    </Suspense>
  );
}
