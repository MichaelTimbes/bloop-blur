import { format, startOfWeek, getISOWeek, getISOWeekYear } from 'date-fns';

/**
 * Get ISO date string (YYYY-MM-DD) for a given date
 */
export function getISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get ISO week key (YYYY-Wnn) for a given date
 * Example: 2026-W05
 */
export function getWeekKey(date: Date = new Date()): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Get the start of the current ISO week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

/**
 * Calculate age in days for a timestamp
 */
export function getAgeDays(timestamp: number, now: number = Date.now()): number {
  const ageMs = now - timestamp;
  return Math.floor(ageMs / (24 * 60 * 60 * 1000));
}

/**
 * Simple hash function to generate deterministic index from date string
 * Used to pick the same spark line for a given date
 */
export function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
