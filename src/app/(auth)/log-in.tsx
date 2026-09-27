import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ThemedText } from '@/components/themed-text';
import { AuthScreen } from '@/components/ui/auth-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

export default function LogInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(undefined);
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);
    if (!result.success) setError(result.error);
  }

  return (
    <AuthScreen>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Welcome back</ThemedText>
        <ThemedText themeColor="textSecondary">Log in to keep your streaks going.</ThemedText>
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
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Your password"
          error={error}
        />
        <Link href="/(auth)/forgot-password">
          <ThemedText type="small" themeColor="accent">
            Forgot password?
          </ThemedText>
        </Link>
        <Button label="Log in" onPress={handleSubmit} loading={loading} disabled={!email || !password} />
      </View>

      <Link href="/(auth)/sign-up" replace>
        <ThemedText type="link" themeColor="accent">
          Don&apos;t have an account? Create one
        </ThemedText>
      </Link>
    </AuthScreen>
  );
}
