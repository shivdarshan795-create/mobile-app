import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ThemedText } from '@/components/themed-text';
import { AuthScreen } from '@/components/ui/auth-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(undefined);
    setLoading(true);
    const result = await signUp({ name, email, password });
    setLoading(false);
    if (!result.success) setError(result.error);
    // On success, the root Stack.Protected guards pick up the new (unonboarded) session automatically.
  }

  return (
    <AuthScreen>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Create your account</ThemedText>
        <ThemedText themeColor="textSecondary">Takes less than a minute.</ThemedText>
      </View>

      <View style={{ gap: Spacing.three, width: '100%' }}>
        <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Alex" />
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
          placeholder="At least 6 characters"
          error={error}
        />
        <Button label="Create account" onPress={handleSubmit} loading={loading} disabled={!name || !email || !password} />
      </View>

      <Link href="/(auth)/log-in" replace>
        <ThemedText type="link" themeColor="accent">
          Already have an account? Log in
        </ThemedText>
      </Link>
    </AuthScreen>
  );
}
