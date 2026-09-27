export type WeekStart = 'monday' | 'sunday';

export type User = {
  id: string;
  email: string;
  name: string;
  goal: string | null;
  onboardingComplete: boolean;
  weekStartsOn: WeekStart;
  createdAt: string;
};

export type AuthResult = { success: true; user: User } | { success: false; error: string };
export type ActionResult = { success: true } | { success: false; error: string };

/**
 * Abstraction over auth so the Supabase-backed implementation could be swapped for another
 * provider later without touching any screen or hook that calls it.
 */
export interface AuthService {
  signUp(params: { name: string; email: string; password: string }): Promise<AuthResult>;
  signIn(params: { email: string; password: string }): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<User | null>;
  /** Sends a reset-password email. Completing the reset happens outside the app (Supabase's hosted page). */
  sendPasswordResetEmail(email: string): Promise<ActionResult>;
  /** Changes the password for the currently signed-in user. */
  updatePassword(newPassword: string): Promise<ActionResult>;
  completeOnboarding(params: { name: string; goal: string }): Promise<AuthResult>;
  updateWeekStart(weekStartsOn: WeekStart): Promise<AuthResult>;
  /** Subscribes to auth state changes (sign-in elsewhere, token refresh, sign-out). Returns an unsubscribe function. */
  onChange(callback: (user: User | null) => void): () => void;
}
