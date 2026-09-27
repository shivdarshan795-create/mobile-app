import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = result?.user_version ?? 0;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        targetValue REAL NOT NULL DEFAULT 1,
        unit TEXT,
        frequency TEXT NOT NULL,
        weekdays TEXT,
        timesPerWeek INTEGER,
        timeOfDay TEXT NOT NULL DEFAULT 'anytime',
        reminderTime TEXT,
        reminderNotificationId TEXT,
        startDate TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS habit_entries (
        id TEXT PRIMARY KEY NOT NULL,
        habitId TEXT NOT NULL,
        date TEXT NOT NULL,
        value REAL NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        completedAt TEXT,
        UNIQUE(habitId, date)
      );

      CREATE TABLE IF NOT EXISTS reward_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        points INTEGER NOT NULL,
        source TEXT,
        habitId TEXT,
        date TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        achievementType TEXT NOT NULL,
        unlockedAt TEXT NOT NULL,
        UNIQUE(userId, achievementType)
      );

      CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(userId);
      CREATE INDEX IF NOT EXISTS idx_entries_habit ON habit_entries(habitId);
      CREATE INDEX IF NOT EXISTS idx_entries_date ON habit_entries(date);
      CREATE INDEX IF NOT EXISTS idx_rewards_user ON reward_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(userId);
    `);
    version = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
