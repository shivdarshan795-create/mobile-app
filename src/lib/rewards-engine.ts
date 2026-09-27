export const POINTS = {
  completion: 10,
  streakBonus: 15,
  perfectDay: 30,
  weeklyGoal: 25,
  milestone: 50,
} as const;

/** Award a streak bonus every 7th consecutive day (7, 14, 21, ...). */
export function isStreakBonusDay(streak: number): boolean {
  return streak > 0 && streak % 7 === 0;
}

export type LevelName = 'Getting Started' | 'Building Momentum' | 'Consistent' | 'Committed' | 'Unstoppable';

const NAMED_LEVELS: { threshold: number; name: LevelName }[] = [
  { threshold: 0, name: 'Getting Started' },
  { threshold: 150, name: 'Building Momentum' },
  { threshold: 400, name: 'Consistent' },
  { threshold: 800, name: 'Committed' },
  { threshold: 1400, name: 'Unstoppable' },
];

/** Level N (N>5) needs progressively more: 1400 + (N-5) * 800. */
function thresholdForLevel(level: number): number {
  if (level <= NAMED_LEVELS.length) return NAMED_LEVELS[level - 1].threshold;
  return NAMED_LEVELS[NAMED_LEVELS.length - 1].threshold + (level - NAMED_LEVELS.length) * 800;
}

export type LevelInfo = {
  level: number;
  name: string;
  totalPoints: number;
  currentThreshold: number;
  nextThreshold: number;
  pointsIntoLevel: number;
  pointsToNextLevel: number;
  progress: number;
};

export function getLevelInfo(totalPoints: number): LevelInfo {
  let level = 1;
  while (thresholdForLevel(level + 1) <= totalPoints) {
    level += 1;
  }
  const currentThreshold = thresholdForLevel(level);
  const nextThreshold = thresholdForLevel(level + 1);
  const pointsIntoLevel = totalPoints - currentThreshold;
  const span = nextThreshold - currentThreshold;

  return {
    level,
    name: level <= NAMED_LEVELS.length ? NAMED_LEVELS[level - 1].name : `Level ${level}`,
    totalPoints,
    currentThreshold,
    nextThreshold,
    pointsIntoLevel,
    pointsToNextLevel: nextThreshold - totalPoints,
    progress: span === 0 ? 1 : pointsIntoLevel / span,
  };
}
