import { todayKey } from '@/lib/date';
import { generateId } from '@/lib/id';
import type { User, UserRow, WeekStart } from './types';
import { getTable, setTable } from './web-store';

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
  _db: unknown,
  params: { name: string; email: string; passwordHash: string }
): Promise<User> {
  const users = await getTable('users');
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
  await setTable('users', [...users, row]);
  return toUser(row);
}

export async function findUserRowByEmail(_db: unknown, email: string): Promise<UserRow | null> {
  const users = await getTable('users');
  return users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
}

export async function findUserById(_db: unknown, id: string): Promise<User | null> {
  const users = await getTable('users');
  const row = users.find((u) => u.id === id);
  return row ? toUser(row) : null;
}

export async function updateUserPassword(_db: unknown, id: string, passwordHash: string): Promise<void> {
  const users = await getTable('users');
  await setTable(
    'users',
    users.map((u) => (u.id === id ? { ...u, passwordHash } : u))
  );
}

export async function completeOnboarding(
  _db: unknown,
  id: string,
  params: { name: string; goal: string }
): Promise<User | null> {
  const users = await getTable('users');
  const next = users.map((u) =>
    u.id === id ? { ...u, name: params.name.trim(), goal: params.goal, onboardingComplete: 1 } : u
  );
  await setTable('users', next);
  const row = next.find((u) => u.id === id);
  return row ? toUser(row) : null;
}

export async function updateWeekStart(_db: unknown, id: string, weekStartsOn: WeekStart): Promise<void> {
  const users = await getTable('users');
  await setTable(
    'users',
    users.map((u) => (u.id === id ? { ...u, weekStartsOn } : u))
  );
}
