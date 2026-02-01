<script setup lang="ts">
import { ref } from 'vue';
import { useArtifactStore } from '../stores/artifacts';
import { useSettingsStore } from '../stores/settings';
import { getISODate, hashDateString } from '../utils/date';
import SparkLine from './SparkLine.vue';

// Import all vibe packs
import zenButDumb from '../content/packs/zen-but-dumb.json';
import existentialButCozy from '../content/packs/existential-but-cozy.json';
import relationalNudges from '../content/packs/relational-nudges.json';
import existentialButMundane from '../content/packs/existential-but-mundane.json';
import natureButUnhinged from '../content/packs/nature-but-unhinged.json';

const emit = defineEmits<{
  complete: [];
  cancel: [];
}>();

const artifactStore = useArtifactStore();
const settingsStore = useSettingsStore();

const fileInput = ref<HTMLInputElement | null>(null);
const capturedBlob = ref<Blob | null>(null);
const showSparkLine = ref(false);
const sparkLine = ref('');
const loading = ref(false);

// Map of vibe pack IDs to their content
const vibePacks: Record<string, string[]> = {
  'zen-but-dumb': zenButDumb,
  'existential-but-cozy': existentialButCozy,
  'relational-nudges': relationalNudges,
  'existential-but-mundane': existentialButMundane,
  'nature-but-unhinged': natureButUnhinged
};

function openFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  loading.value = true;

  try {
    capturedBlob.value = file;

    // Get today's spark line deterministically
    const activePackId = settingsStore.settings.activeVibePack;
    const pack = vibePacks[activePackId] || vibePacks['zen-but-dumb'];
    const today = getISODate();
    const hash = hashDateString(today);
    const sparkIndex = hash % pack.length;
    sparkLine.value = pack[sparkIndex];

    // Save artifact
    await artifactStore.saveArtifact(capturedBlob.value, activePackId, sparkIndex);

    // Show spark line
    showSparkLine.value = true;
  } catch (error) {
    console.error('Failed to save artifact:', error);
    emit('cancel');
  } finally {
    loading.value = false;
  }
}

function handleDone() {
  emit('complete');
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <div class="capture-flow">
    <div class="capture-overlay">
      <div class="capture-content">
        <template v-if="!showSparkLine">
          <h2 class="capture-title">Capture a moment</h2>
          <p class="capture-subtitle">Take or select a photo</p>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            capture="environment"
            style="display: none"
            @change="handleFileSelect"
          />

          <button 
            class="capture-button" 
            @click="openFileInput"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Choose Photo' }}
          </button>

          <button class="cancel-button" @click="handleCancel">
            Cancel
          </button>
        </template>

        <SparkLine 
          v-else
          :spark-line="sparkLine"
          @done="handleDone"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.capture-flow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.capture-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.capture-content {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow);
}

.capture-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}

.capture-subtitle {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 30px;
}

.capture-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 12px;
}

.capture-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.capture-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--muted);
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: var(--muted);
  color: white;
}

@media (max-width: 768px) {
  .capture-content {
    padding: 30px 20px;
  }

  .capture-title {
    font-size: 20px;
  }

  .capture-subtitle {
    font-size: 14px;
  }
}
</style>
