import type { ReactNode } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from './schema';

export { useSQLiteContext as useDb } from 'expo-sqlite';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName="habit-tracker.db" onInit={migrateDatabase} useSuspense>
      {children}
    </SQLiteProvider>
  );
}
