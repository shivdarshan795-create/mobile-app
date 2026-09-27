import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useDb } from '@/db/provider';
import type { User } from '@/db/types';
import { createLocalAuthService } from './local-auth-service';
import type { AuthResult } from './types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signUp: (params: { name: string; email: string; password: string }) => Promise<AuthResult>;
  signIn: (params: { email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (params: { email: string; newPassword: string }) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useDb();
  const service = useMemo(() => createLocalAuthService(db), [db]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service.getSession().then((sessionUser) => {
      setUser(sessionUser);
      setIsLoading(false);
    });
  }, [service]);

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
      async resetPassword(params) {
        return service.resetPassword(params);
      },
      async refreshUser() {
        setUser(await service.getSession());
      },
    }),
    [service, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
