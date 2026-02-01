import type { Trace, Settings } from '../types';
import { DEFAULT_VIBE_PACK, DEFAULT_DELETION_POLICY } from '../config';

const TRACE_KEY = 'boop-blur-trace';
const SETTINGS_KEY = 'boop-blur-settings';

/**
 * Get trace data from localStorage
 */
export function getTrace(): Trace {
  const stored = localStorage.getItem(TRACE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalBoops: 0,
    lastBoopTs: 0
  };
}

/**
 * Save trace data to localStorage
 */
export function saveTrace(trace: Trace): void {
  localStorage.setItem(TRACE_KEY, JSON.stringify(trace));
}

/**
 * Increment boop counter
 */
export function incrementBoops(): void {
  const trace = getTrace();
  trace.totalBoops++;
  trace.lastBoopTs = Date.now();
  saveTrace(trace);
}

/**
 * Get settings from localStorage
 */
export function getSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    activeVibePack: DEFAULT_VIBE_PACK,
    deletionPolicy: DEFAULT_DELETION_POLICY
  };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
