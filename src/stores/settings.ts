import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSettings, saveSettings as saveSettingsToStorage } from '../utils/storage';
import type { Settings } from '../types';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(getSettings());

  function setActiveVibePack(packId: string) {
    settings.value.activeVibePack = packId;
    saveSettingsToStorage(settings.value);
  }

  function reset() {
    settings.value = {
      activeVibePack: 'zen-but-dumb'
    };
    saveSettingsToStorage(settings.value);
  }

  return {
    settings,
    setActiveVibePack,
    reset
  };
});
