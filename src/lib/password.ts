import * as Crypto from 'expo-crypto';

// Static pepper is fine here: this is a local-only mock auth service (see auth/local-auth-service.ts),
// not a real security boundary. Swap the whole AuthService implementation before shipping with real users.
const PEPPER = 'habit-tracker-local-v1';

export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${PEPPER}:${password}`);
}
