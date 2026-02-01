import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { artifactRepo } from '../repositories/artifacts';
import { generateId } from '../utils/helpers';
import { getISODate, getWeekKey, getAgeDays } from '../utils/date';
import type { Artifact } from '../types';
import { useSettingsStore } from './settings';

export const useArtifactStore = defineStore('artifacts', () => {
  const artifacts = ref<Artifact[]>([]);
  const loading = ref(false);

  // Load all artifacts from IndexedDB
  async function loadArtifacts() {
    loading.value = true;
    try {
      artifacts.value = await artifactRepo.getAllArtifacts();
    } finally {
      loading.value = false;
    }
  }

  // Save a new artifact
  async function saveArtifact(
    blob: Blob,
    sparkPackId: string,
    sparkIndex: number
  ): Promise<Artifact> {
    const now = Date.now();
    const artifact: Artifact = {
      id: generateId(),
      ts: now,
      isoDate: getISODate(new Date(now)),
      weekKey: getWeekKey(new Date(now)),
      type: 'photo',
      blob,
      sparkPackId,
      sparkIndex
    };

    await artifactRepo.saveArtifact(artifact);
    artifacts.value.push(artifact);
    return artifact;
  }

  // Get artifacts for the current week
  const currentWeekArtifacts = computed(() => {
    const currentWeek = getWeekKey();
    return artifacts.value.filter(a => a.weekKey === currentWeek);
  });

  // Get artifacts for today
  const todayArtifacts = computed(() => {
    const today = getISODate();
    return artifacts.value.filter(a => a.isoDate === today);
  });

  // Check if user has booped today
  const hasBoopedToday = computed(() => {
    return todayArtifacts.value.length > 0;
  });

  // Delete an artifact
  async function deleteArtifact(id: string) {
    await artifactRepo.deleteArtifact(id);
    artifacts.value = artifacts.value.filter(a => a.id !== id);
  }

  // Run cleanup job based on deletion policy
  async function runCleanupJob() {
    await loadArtifacts();
    
    const settingsStore = useSettingsStore();
    const policy = settingsStore.settings.deletionPolicy;
    
    if (policy === 'off') return;

    const now = Date.now();
    const idsToDelete: string[] = [];

    if (policy === 'delete-14-days') {
      // Delete artifacts older than 14 days
      artifacts.value.forEach(artifact => {
        if (getAgeDays(artifact.ts, now) > 14) {
          idsToDelete.push(artifact.id);
        }
      });
    } else if (policy === 'keep-4-weeks') {
      // Delete artifacts older than 28 days (4 weeks)
      artifacts.value.forEach(artifact => {
        if (getAgeDays(artifact.ts, now) > 28) {
          idsToDelete.push(artifact.id);
        }
      });
    }

    if (idsToDelete.length > 0) {
      await artifactRepo.deleteArtifactsByIds(idsToDelete);
      artifacts.value = artifacts.value.filter(a => !idsToDelete.includes(a.id));
    }
  }

  return {
    artifacts,
    loading,
    currentWeekArtifacts,
    todayArtifacts,
    hasBoopedToday,
    loadArtifacts,
    saveArtifact,
    deleteArtifact,
    runCleanupJob
  };
});
