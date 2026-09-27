import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createSupabaseAuthService } from './supabase-auth-service';
import type { ActionResult, AuthResult, User, WeekStart } from './types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signUp: (params: { name: string; email: string; password: string }) => Promise<AuthResult>;
  signIn: (params: { email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<ActionResult>;
  updatePassword: (newPassword: string) => Promise<ActionResult>;
  completeOnboarding: (params: { name: string; goal: string }) => Promise<AuthResult>;
  updateWeekStart: (weekStartsOn: WeekStart) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Stateless (holds no per-render state of its own), safe as a module-level singleton.
const service = createSupabaseAuthService();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service.getSession().then((sessionUser) => {
      setUser(sessionUser);
      setIsLoading(false);
    });

    // Keeps context in sync with token refresh / sign-out happening outside this provider's own calls.
    return service.onChange((nextUser) => setUser(nextUser));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async signUp(params) {
        const result = await service.signUp(params);
        if (result.success) setUser(result.user);
        return result;
      },
      async signIn(params) {
        const result = await service.signIn(params);
        if (result.success) setUser(result.user);
        return result;
      },
      async signOut() {
        await service.signOut();
        setUser(null);
      },
      sendPasswordResetEmail: (email) => service.sendPasswordResetEmail(email),
      updatePassword: (newPassword) => service.updatePassword(newPassword),
      async completeOnboarding(params) {
        const result = await service.completeOnboarding(params);
        if (result.success) setUser(result.user);
        return result;
      },
      async updateWeekStart(weekStartsOn) {
        const result = await service.updateWeekStart(weekStartsOn);
        if (result.success) setUser(result.user);
        return result;
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
