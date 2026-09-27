export type AchievementContext = {
  totalCompletions: number;
  bestStreakAcrossHabits: number;
  perfectDayStreak: number;
  morningStreak: number;
  totalPerfectDays: number;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (ctx: AchievementContext) => boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first habit',
    icon: '🌱',
    isUnlocked: (ctx) => ctx.totalCompletions >= 1,
  },
  {
    id: 'getting_consistent',
    title: 'Getting Consistent',
    description: '7-day streak',
    icon: '🔥',
    isUnlocked: (ctx) => ctx.bestStreakAcrossHabits >= 7,
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll',
    description: '30 completions',
    icon: '🚀',
    isUnlocked: (ctx) => ctx.totalCompletions >= 30,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete every scheduled habit for 7 days',
    icon: '🏆',
    isUnlocked: (ctx) => ctx.perfectDayStreak >= 7,
  },
  {
    id: 'century',
    title: 'Century',
    description: '100 total habit completions',
    icon: '💯',
    isUnlocked: (ctx) => ctx.totalCompletions >= 100,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete morning habits for 7 consecutive days',
    icon: '🌅',
    isUnlocked: (ctx) => ctx.morningStreak >= 7,
  },
];
