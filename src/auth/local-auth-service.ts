import type { SQLiteDatabase } from 'expo-sqlite';

import { createUser, findUserById, findUserRowByEmail, updateUserPassword } from '@/db/users';
import { hashPassword } from '@/lib/password';
import { secureStorage } from '@/lib/secure-storage';
import type { AuthResult, AuthService } from './types';

const SESSION_KEY = 'habit_tracker_session_user_id';

/**
 * Local, offline auth implementation: accounts and password hashes live in SQLite, the active
 * session id lives in SecureStore. "Forgot password" resets directly (email + new password) since
 * there's no mail server to verify through — swap this file for a real backend later; nothing
 * upstream (AuthContext, screens) depends on how signIn/signUp are actually implemented.
 */
export function createLocalAuthService(db: SQLiteDatabase): AuthService {
  return {
    async signUp({ name, email, password }) {
      if (!name.trim()) return { success: false, error: 'Enter your name.' };
      if (!email.includes('@')) return { success: false, error: 'Enter a valid email address.' };
      if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

      const existing = await findUserRowByEmail(db, email);
      if (existing) return { success: false, error: 'An account with this email already exists.' };

      const passwordHash = await hashPassword(password);
      const user = await createUser(db, { name, email, passwordHash });
      await secureStorage.setItem(SESSION_KEY, user.id);
      return { success: true, user };
    },

    async signIn({ email, password }) {
      const row = await findUserRowByEmail(db, email);
      if (!row) return { success: false, error: 'No account found with this email.' };

      const passwordHash = await hashPassword(password);
      if (passwordHash !== row.passwordHash) return { success: false, error: 'Incorrect password.' };

      await secureStorage.setItem(SESSION_KEY, row.id);
      const user = await findUserById(db, row.id);
      return user ? { success: true, user } : { success: false, error: 'Something went wrong. Try again.' };
    },

    async signOut() {
      await secureStorage.removeItem(SESSION_KEY);
    },

    async resetPassword({ email, newPassword }) {
      const row = await findUserRowByEmail(db, email);
      if (!row) return { success: false, error: 'No account found with this email.' };
      if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

      const passwordHash = await hashPassword(newPassword);
      await updateUserPassword(db, row.id, passwordHash);
      const user = await findUserById(db, row.id);
      return user ? { success: true, user } : { success: false, error: 'Something went wrong. Try again.' };
    },

    async getSession() {
      const userId = await secureStorage.getItem(SESSION_KEY);
      if (!userId) return null;
      return findUserById(db, userId);
    },
  };
}
