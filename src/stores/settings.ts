import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSettings, saveSettings as saveSettingsToStorage } from '../utils/storage';
import type { Settings, DeletionPolicy } from '../types';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(getSettings());

  function setActiveVibePack(packId: string) {
    settings.value.activeVibePack = packId;
    saveSettingsToStorage(settings.value);
  }

  function setDeletionPolicy(policy: DeletionPolicy) {
    settings.value.deletionPolicy = policy;
    saveSettingsToStorage(settings.value);
  }

  function reset() {
    settings.value = {
      activeVibePack: 'zen-but-dumb',
      deletionPolicy: 'off'
    };
    saveSettingsToStorage(settings.value);
  }

  return {
    settings,
    setActiveVibePack,
    setDeletionPolicy,
    reset
  };
});
