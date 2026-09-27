import { todayKey } from '@/lib/date';
import { generateId } from '@/lib/id';
import type { NewHabitInput, UpdateHabitInput } from './habits';
import type { Habit, HabitRow, HabitStatus } from './types';
import { getTable, setTable } from './web-store';

function toHabit(row: HabitRow): Habit {
  return { ...row, weekdays: row.weekdays ? (JSON.parse(row.weekdays) as number[]) : null };
}

export async function createHabit(_db: unknown, input: NewHabitInput): Promise<Habit> {
  const habits = await getTable('habits');
  const row: HabitRow = {
    id: generateId(),
    userId: input.userId,
    title: input.title.trim(),
    icon: input.icon,
    category: input.category,
    type: input.type,
    targetValue: input.targetValue,
    unit: input.unit,
    frequency: input.frequency,
    weekdays: input.weekdays ? JSON.stringify(input.weekdays) : null,
    timesPerWeek: input.timesPerWeek,
    timeOfDay: input.timeOfDay,
    reminderTime: input.reminderTime,
    reminderNotificationId: null,
    startDate: input.startDate,
    status: 'active',
    createdAt: todayKey(),
  };
  await setTable('habits', [...habits, row]);
  return toHabit(row);
}

export async function listHabits(
  _db: unknown,
  userId: string,
  statuses: HabitStatus[] = ['active']
): Promise<Habit[]> {
  const habits = await getTable('habits');
  return habits
    .filter((h) => h.userId === userId && statuses.includes(h.status))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map(toHabit);
}

export async function getHabit(_db: unknown, id: string): Promise<Habit | null> {
  const habits = await getTable('habits');
  const row = habits.find((h) => h.id === id);
  return row ? toHabit(row) : null;
}

export async function updateHabit(_db: unknown, id: string, input: UpdateHabitInput): Promise<void> {
  const habits = await getTable('habits');
  await setTable(
    'habits',
    habits.map((h) => {
      if (h.id !== id) return h;
      const next: HabitRow = { ...h };
      for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        if (key === 'weekdays') {
          next.weekdays = value ? JSON.stringify(value as number[]) : null;
        } else {
          (next as unknown as Record<string, unknown>)[key] = value;
        }
      }
      return next;
    })
  );
}

export async function setHabitStatus(_db: unknown, id: string, status: HabitStatus): Promise<void> {
  const habits = await getTable('habits');
  await setTable(
    'habits',
    habits.map((h) => (h.id === id ? { ...h, status } : h))
  );
}
