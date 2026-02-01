// Type definitions for Boop-Blur

export interface Artifact {
  id: string;
  ts: number; // timestamp in milliseconds
  isoDate: string; // YYYY-MM-DD
  weekKey: string; // ISO week key like 2026-W05
  type: 'photo';
  blob: Blob;
  sparkPackId: string;
  sparkIndex: number;
}

export interface Trace {
  totalBoops: number;
  lastBoopTs: number;
}

export interface Settings {
  activeVibePack: string;
  deletionPolicy: 'off' | 'keep-4-weeks' | 'delete-14-days';
}

export interface VibePack {
  id: string;
  name: string;
  sparkLines: string[];
}

export type DeletionPolicy = 'off' | 'keep-4-weeks' | 'delete-14-days';
