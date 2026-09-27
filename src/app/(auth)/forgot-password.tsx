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
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(undefined);
    setLoading(true);
    const result = await sendPasswordResetEmail(email);
    setLoading(false);
    if (!result.success) setError(result.error);
    else setSent(true);
  }

  if (sent) {
    return (
      <AuthScreen>
        <View style={{ gap: Spacing.two, alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 32 }}>📬</ThemedText>
          <ThemedText type="heading" style={{ textAlign: 'center' }}>
            Check your email
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            We sent a password reset link to {email}. Open it to set a new password, then come back
            and log in.
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
          Enter your account email and we&apos;ll send you a link to set a new password.
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
          error={error}
        />
        <Button label="Send reset link" onPress={handleSubmit} loading={loading} disabled={!email} />
      </View>
    </AuthScreen>
  );
}
