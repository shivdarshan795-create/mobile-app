import { router } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthScreen } from '@/components/ui/auth-screen';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <AuthScreen>
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center', gap: Spacing.two }}>
        <ThemedText type="display" themeColor="accent">
          Habit
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
          Small steps, every day. Track what matters and watch your consistency grow.
        </ThemedText>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: Spacing.three, width: '100%' }}>
        <Button label="Create account" onPress={() => router.push('/(auth)/sign-up')} />
        <Button label="Log in" variant="secondary" onPress={() => router.push('/(auth)/log-in')} />
      </View>
    </AuthScreen>
  );
}
