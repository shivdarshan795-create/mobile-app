import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ThemedText } from '@/components/themed-text';
import { AuthScreen } from '@/components/ui/auth-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(undefined);
    setLoading(true);
    const result = await resetPassword({ email, newPassword });
    setLoading(false);
    if (!result.success) setError(result.error);
    else setDone(true);
  }

  if (done) {
    return (
      <AuthScreen>
        <View style={{ gap: Spacing.two, alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 32 }}>✅</ThemedText>
          <ThemedText type="heading" style={{ textAlign: 'center' }}>
            Password updated
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            You can log in with your new password now.
          </ThemedText>
        </View>
        <Button label="Back to log in" onPress={() => router.replace('/(auth)/log-in')} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Reset password</ThemedText>
        <ThemedText themeColor="textSecondary">
          This app runs fully offline, so there&apos;s no email to send — confirm your account email
          and choose a new password directly.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.three, width: '100%' }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="At least 6 characters"
          error={error}
        />
        <Button label="Update password" onPress={handleSubmit} loading={loading} disabled={!email || !newPassword} />
      </View>
    </AuthScreen>
  );
}
