import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/lib/id';
import { todayKey } from '@/lib/date';
import type { User, UserRow, WeekStart } from './types';

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    goal: row.goal,
    weekStartsOn: row.weekStartsOn,
    createdAt: row.createdAt,
    onboardingComplete: row.onboardingComplete === 1,
  };
}

export async function createUser(
  db: SQLiteDatabase,
  params: { name: string; email: string; passwordHash: string }
): Promise<User> {
  const row: UserRow = {
    id: generateId(),
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    passwordHash: params.passwordHash,
    goal: null,
    onboardingComplete: 0,
    weekStartsOn: 'monday',
    createdAt: todayKey(),
  };
  await db.runAsync(
    `INSERT INTO users (id, name, email, passwordHash, goal, onboardingComplete, weekStartsOn, createdAt)
     VALUES ($id, $name, $email, $passwordHash, $goal, $onboardingComplete, $weekStartsOn, $createdAt)`,
    {
      $id: row.id,
      $name: row.name,
      $email: row.email,
      $passwordHash: row.passwordHash,
      $goal: row.goal,
      $onboardingComplete: row.onboardingComplete,
      $weekStartsOn: row.weekStartsOn,
      $createdAt: row.createdAt,
    }
  );
  return toUser(row);
}

export async function findUserRowByEmail(db: SQLiteDatabase, email: string): Promise<UserRow | null> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  return row ?? null;
}

export async function findUserById(db: SQLiteDatabase, id: string): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row ? toUser(row) : null;
}

export async function updateUserPassword(db: SQLiteDatabase, id: string, passwordHash: string): Promise<void> {
  await db.runAsync('UPDATE users SET passwordHash = ? WHERE id = ?', [passwordHash, id]);
}

export async function completeOnboarding(
  db: SQLiteDatabase,
  id: string,
  params: { name: string; goal: string }
): Promise<User | null> {
  await db.runAsync('UPDATE users SET name = ?, goal = ?, onboardingComplete = 1 WHERE id = ?', [
    params.name.trim(),
    params.goal,
    id,
  ]);
  return findUserById(db, id);
}

export async function updateWeekStart(db: SQLiteDatabase, id: string, weekStartsOn: WeekStart): Promise<void> {
  await db.runAsync('UPDATE users SET weekStartsOn = ? WHERE id = ?', [weekStartsOn, id]);
}
