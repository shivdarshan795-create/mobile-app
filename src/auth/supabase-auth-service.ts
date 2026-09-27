import type { User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { ActionResult, AuthResult, AuthService, User, WeekStart } from './types';

function toUser(supabaseUser: SupabaseUser): User {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: typeof meta.name === 'string' ? meta.name : '',
    goal: typeof meta.goal === 'string' ? meta.goal : null,
    onboardingComplete: meta.onboardingComplete === true,
    weekStartsOn: meta.weekStartsOn === 'sunday' ? 'sunday' : 'monday',
    createdAt: supabaseUser.created_at,
  };
}

function errorResult(error: unknown): { success: false; error: string } {
  return { success: false, error: error instanceof Error ? error.message : 'Something went wrong. Try again.' };
}

export function createSupabaseAuthService(): AuthService {
  return {
    async signUp({ name, email, password }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), onboardingComplete: false, weekStartsOn: 'monday' } },
      });
      if (error) return errorResult(error);
      if (!data.session || !data.user) {
        return { success: false, error: 'Account created — check your email to confirm it, then log in.' };
      }
      return { success: true, user: toUser(data.user) };
    },

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return errorResult(error);
      return { success: true, user: toUser(data.user) };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async getSession() {
      const { data } = await supabase.auth.getSession();
      return data.session?.user ? toUser(data.session.user) : null;
    },

    async sendPasswordResetEmail(email: string): Promise<ActionResult> {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return errorResult(error);
      return { success: true };
    },

    async updatePassword(newPassword: string): Promise<ActionResult> {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return errorResult(error);
      return { success: true };
    },

    async completeOnboarding({ name, goal }): Promise<AuthResult> {
      const { data, error } = await supabase.auth.updateUser({
        data: { name: name.trim(), goal, onboardingComplete: true },
      });
      if (error) return errorResult(error);
      return { success: true, user: toUser(data.user) };
    },

    async updateWeekStart(weekStartsOn: WeekStart): Promise<AuthResult> {
      const { data, error } = await supabase.auth.updateUser({ data: { weekStartsOn } });
      if (error) return errorResult(error);
      return { success: true, user: toUser(data.user) };
    },

    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? toUser(session.user) : null);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}
