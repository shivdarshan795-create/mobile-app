import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1C',
    textSecondary: '#6B6B70',
    textMuted: '#9C9BA1',
    border: '#EAE6E1',
    accent: '#4640C2',
    accentSoft: '#ECEBFA',
    onAccent: '#FFFFFF',
    success: '#2E9B5A',
    successSoft: '#E3F5EA',
    warning: '#B9791A',
    warningSoft: '#FBF0DD',
    danger: '#C2483F',
    dangerSoft: '#FBEAE8',
  },
  dark: {
    background: '#121214',
    surface: '#1C1C1F',
    surfaceElevated: '#232327',
    text: '#F4F3F1',
    textSecondary: '#A7A6AC',
    textMuted: '#77767D',
    border: '#2C2C31',
    accent: '#8B87E8',
    accentSoft: '#28264C',
    onAccent: '#12121A',
    success: '#57C685',
    successSoft: '#173321',
    warning: '#E0A94A',
    warningSoft: '#3A2B10',
    danger: '#E2685D',
    dangerSoft: '#3A1917',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;

/** Category → accent used sparingly (icon tint), never as the app's dominant color. */
export const CategoryColors = {
  health: '#2E9B5A',
  fitness: '#B9791A',
  mind: '#4640C2',
  learning: '#2B6FB0',
  productivity: '#6B6B70',
  personal: '#8B5CB0',
} as const;

export type HabitCategoryKey = keyof typeof CategoryColors;
