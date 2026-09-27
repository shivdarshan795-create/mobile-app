import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="habit/new" options={{ presentation: 'modal', headerShown: true, title: 'New habit' }} />
      <Stack.Screen name="habit/[id]/index" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="habit/[id]/edit" options={{ presentation: 'modal', headerShown: true, title: 'Edit habit' }} />
    </Stack>
  );
}
