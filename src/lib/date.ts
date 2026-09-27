export function todayKey(): string {
  return dateKey(new Date());
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** Oldest-first array of the last `count` date keys, including today. */
export function lastNDateKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(dateKey(addDays(from, -i)));
  }
  return keys;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

export function weekdayIndex(date: Date): number {
  return date.getDay();
}

export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

export function startOfWeekKey(key: string, weekStartsOn: 'monday' | 'sunday' = 'monday'): string {
  const date = parseDateKey(key);
  const day = date.getDay();
  const diff = weekStartsOn === 'monday' ? (day === 0 ? 6 : day - 1) : day;
  return dateKey(addDays(date, -diff));
}
