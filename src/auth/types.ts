import type { User } from '@/db/types';

export type AuthResult = { success: true; user: User } | { success: false; error: string };

/**
 * Abstraction over auth so the local, backend-free implementation can be swapped for
 * Supabase/Firebase/etc. later without touching any screen or hook that calls it.
 */
export interface AuthService {
  signUp(params: { name: string; email: string; password: string }): Promise<AuthResult>;
  signIn(params: { email: string; password: string }): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(params: { email: string; newPassword: string }): Promise<AuthResult>;
  getSession(): Promise<User | null>;
}
