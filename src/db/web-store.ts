import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AchievementRow, HabitEntryRow, HabitRow, RewardTransactionRow, UserRow } from './types';

/**
 * Web-only stand-in for the SQLite database (see README note in provider.web.tsx for why).
 * Same shape as the SQLite tables, held in memory and mirrored to localStorage (via AsyncStorage's
 * web implementation) so a page reload doesn't lose data. Not a real query engine — each db/*.web.ts
 * file does its own filtering/sorting in JS instead of SQL.
 */
type Tables = {
  users: UserRow[];
  habits: HabitRow[];
  habit_entries: HabitEntryRow[];
  reward_transactions: RewardTransactionRow[];
  achievements: AchievementRow[];
};

const STORAGE_KEY = 'habit-tracker-web-db-v1';

function emptyTables(): Tables {
  return { users: [], habits: [], habit_entries: [], reward_transactions: [], achievements: [] };
}

let cache: Tables | null = null;
let loadPromise: Promise<Tables> | null = null;

async function load(): Promise<Tables> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const loaded: Tables = raw ? { ...emptyTables(), ...JSON.parse(raw) } : emptyTables();
      cache = loaded;
      return loaded;
    });
  }
  const resolved = await loadPromise;
  return resolved;
}

function persist() {
  if (cache) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export async function getTable<K extends keyof Tables>(name: K): Promise<Tables[K]> {
  const tables = await load();
  return tables[name];
}

export async function setTable<K extends keyof Tables>(name: K, rows: Tables[K]): Promise<void> {
  const tables = await load();
  tables[name] = rows;
  persist();
}
