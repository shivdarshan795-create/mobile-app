export type HabitType = 'yesno' | 'quantity' | 'duration';
export type HabitFrequency = 'daily' | 'weekdays' | 'timesPerWeek';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type HabitCategory = 'health' | 'fitness' | 'mind' | 'learning' | 'productivity' | 'personal';

export type WeekStart = 'monday' | 'sunday';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  goal: string | null;
  onboardingComplete: number;
  weekStartsOn: WeekStart;
  createdAt: string;
};

export type HabitRow = {
  id: string;
  userId: string;
  title: string;
  icon: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number;
  unit: string | null;
  frequency: HabitFrequency;
  /** JSON-encoded array of 0-6 (0=Sunday), present when frequency = 'weekdays'. */
  weekdays: string | null;
  timesPerWeek: number | null;
  timeOfDay: TimeOfDay;
  reminderTime: string | null;
  reminderNotificationId: string | null;
  startDate: string;
  status: HabitStatus;
  createdAt: string;
};

export type HabitEntryRow = {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: number;
  completedAt: string | null;
};

export type RewardType = 'completion' | 'streak_bonus' | 'perfect_day' | 'weekly_goal' | 'milestone';

export type RewardTransactionRow = {
  id: string;
  userId: string;
  type: RewardType;
  points: number;
  source: string | null;
  habitId: string | null;
  date: string;
  createdAt: string;
};

export type AchievementRow = {
  id: string;
  userId: string;
  achievementType: string;
  unlockedAt: string;
};

export type Habit = Omit<HabitRow, 'weekdays'> & {
  weekdays: number[] | null;
};

export type User = Omit<UserRow, 'passwordHash' | 'onboardingComplete'> & {
  onboardingComplete: boolean;
};
