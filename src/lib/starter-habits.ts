import type { HabitCategory, HabitType, TimeOfDay } from '@/db/types';

export const GOALS = ['Health', 'Fitness', 'Mindfulness', 'Productivity', 'Learning', 'Personal'] as const;
export type Goal = (typeof GOALS)[number];

export type StarterHabit = {
  title: string;
  icon: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number;
  unit: string | null;
  timeOfDay: TimeOfDay;
};

export const STARTER_HABITS: Record<Goal, StarterHabit[]> = {
  Health: [
    { title: 'Drink water', icon: '💧', category: 'health', type: 'quantity', targetValue: 8, unit: 'glasses', timeOfDay: 'anytime' },
    { title: 'Sleep before 11 PM', icon: '😴', category: 'health', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'evening' },
    { title: 'Eat a vegetable', icon: '🥦', category: 'health', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'anytime' },
  ],
  Fitness: [
    { title: 'Walk 8,000 steps', icon: '🚶', category: 'fitness', type: 'quantity', targetValue: 8000, unit: 'steps', timeOfDay: 'anytime' },
    { title: 'Exercise', icon: '🏋️', category: 'fitness', type: 'duration', targetValue: 30, unit: 'min', timeOfDay: 'morning' },
    { title: 'Stretch', icon: '🤸', category: 'fitness', type: 'duration', targetValue: 10, unit: 'min', timeOfDay: 'anytime' },
  ],
  Mindfulness: [
    { title: 'Meditate', icon: '🧘', category: 'mind', type: 'duration', targetValue: 10, unit: 'min', timeOfDay: 'morning' },
    { title: 'Journal', icon: '✍️', category: 'mind', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'evening' },
    { title: 'Gratitude note', icon: '🙏', category: 'mind', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'evening' },
  ],
  Productivity: [
    { title: 'Plan tomorrow', icon: '🗓️', category: 'productivity', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'evening' },
    { title: 'Inbox zero', icon: '📥', category: 'productivity', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'anytime' },
    { title: 'Deep work block', icon: '💻', category: 'productivity', type: 'duration', targetValue: 60, unit: 'min', timeOfDay: 'morning' },
  ],
  Learning: [
    { title: 'Read', icon: '📖', category: 'learning', type: 'duration', targetValue: 20, unit: 'min', timeOfDay: 'evening' },
    { title: 'Practice a language', icon: '🗣️', category: 'learning', type: 'duration', targetValue: 15, unit: 'min', timeOfDay: 'anytime' },
    { title: 'Learn something new', icon: '💡', category: 'learning', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'anytime' },
  ],
  Personal: [
    { title: 'Call a friend or family', icon: '📞', category: 'personal', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'anytime' },
    { title: 'Tidy up', icon: '🧹', category: 'personal', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'anytime' },
    { title: 'Screen-free hour', icon: '📵', category: 'personal', type: 'duration', targetValue: 60, unit: 'min', timeOfDay: 'evening' },
  ],
};
