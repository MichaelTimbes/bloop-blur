<script setup lang="ts">
import { ref, computed } from 'vue';
import { useArtifactStore } from '../stores/artifacts';
import { useSettingsStore } from '../stores/settings';
import { getISODate, hashDateString } from '../utils/date';
import { fadeOut, prefersReducedMotion } from '../utils/flip';
import SparkLine from './SparkLine.vue';
import GhostMosaicOverlay from './GhostMosaicOverlay.vue';

// Import all vibe packs
import zenButDumb from '../content/packs/zen-but-dumb.json';
import existentialButCozy from '../content/packs/existential-but-cozy.json';
import relationalNudges from '../content/packs/relational-nudges.json';
import existentialButMundane from '../content/packs/existential-but-mundane.json';
import natureButUnhinged from '../content/packs/nature-but-unhinged.json';

type CaptureState = 'capturing' | 'landing' | 'spark' | 'done';

const emit = defineEmits<{
  complete: [];
  cancel: [];
}>();

const artifactStore = useArtifactStore();
const settingsStore = useSettingsStore();
const isDevelopment = import.meta.env.DEV;

const fileInput = ref<HTMLInputElement | null>(null);
const capturedBlob = ref<Blob | null>(null);
const capturedPreviewUrl = ref<string>('');
const sparkLine = ref('');
const loading = ref(false);
const state = ref<CaptureState>('capturing');
const savedArtifactId = ref<string>('');
const ghostMosaicRef = ref<InstanceType<typeof GhostMosaicOverlay> | null>(null);
const errorMessage = ref<string>('');
const showNewCapture = ref(false);
const fadeToBlack = ref(false);

// Map of vibe pack IDs to their content
const vibePacks: Record<string, string[]> = {
  'zen-but-dumb': zenButDumb,
  'existential-but-cozy': existentialButCozy,
  'relational-nudges': relationalNudges,
  'existential-but-mundane': existentialButMundane,
  'nature-but-unhinged': natureButUnhinged
};

const showCapture = computed(() => state.value === 'capturing');
const showLanding = computed(() => state.value === 'landing');
const showSparkLine = computed(() => state.value === 'spark');

function openFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    capturedBlob.value = file;
    capturedPreviewUrl.value = URL.createObjectURL(file);

    // Get today's spark line deterministically
    const activePackId = settingsStore.settings.activeVibePack || 'zen-but-dumb';
    const pack = vibePacks[activePackId];
    const today = getISODate();
    const hash = hashDateString(today);
    
    let sparkIndex: number;
    if (!pack) {
      console.warn(`Vibe pack "${activePackId}" not found, falling back to zen-but-dumb`);
      const fallbackPack = vibePacks['zen-but-dumb'];
      sparkIndex = hash % fallbackPack.length;
      sparkLine.value = fallbackPack[sparkIndex];
    } else {
      sparkIndex = hash % pack.length;
      sparkLine.value = pack[sparkIndex];
    }

    // Save artifact
    const artifact = await artifactStore.saveArtifact(capturedBlob.value, activePackId, sparkIndex);
    savedArtifactId.value = artifact.id;

    // Check for reduced motion
    if (prefersReducedMotion()) {
      // Skip animation, go straight to spark
      state.value = 'spark';
    } else {
      // Show landing animation
      state.value = 'landing';
      // Animation will be triggered after ghost mosaic mounts
    }
  } catch (error) {
    console.error('Failed to save artifact:', error);
    errorMessage.value = 'Failed to save artifact. Please try again.';
    loading.value = false;
  }
}

async function handleGhostMosaicReady() {
  if (!ghostMosaicRef.value || prefersReducedMotion()) {
    // Skip animation
    state.value = 'spark';
    return;
  }

  try {
    // Show existing mosaic fading in (300ms), pause for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Now fade in the new capture
    showNewCapture.value = true;

    // Wait for new capture to fade in (600ms), then start fading to black
    await new Promise(resolve => setTimeout(resolve, 600));

    // Trigger fade to black transition
    fadeToBlack.value = true;

    // Wait for fade to black to complete (2.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Transition to spark view (which fades in from black)
    state.value = 'spark';
    loading.value = false;
  } catch (error) {
    console.error('Animation error:', error);
    state.value = 'spark';
    loading.value = false;
  }
}

function handleDone() {
  state.value = 'done';
  emit('complete');
}

function handleCancel() {
  // Reset state
  if (capturedPreviewUrl.value) {
    URL.revokeObjectURL(capturedPreviewUrl.value);
  }
  state.value = 'capturing';
  errorMessage.value = '';
  emit('cancel');
}

// Development only: skip to spark line
async function skipToSparkLine() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1, 1);
  }
  
  canvas.toBlob(async (blob) => {
    if (blob) {
      capturedBlob.value = blob;
      const activePackId = settingsStore.settings.activeVibePack || 'zen-but-dumb';
      const pack = vibePacks[activePackId];
      const today = getISODate();
      const hash = hashDateString(today);
      
      let sparkIndex: number;
      if (!pack) {
        console.warn(`Vibe pack "${activePackId}" not found, falling back to zen-but-dumb`);
        const fallbackPack = vibePacks['zen-but-dumb'];
        sparkIndex = hash % fallbackPack.length;
        sparkLine.value = fallbackPack[sparkIndex];
      } else {
        sparkIndex = hash % pack.length;
        sparkLine.value = pack[sparkIndex];
      }
      
      const artifact = await artifactStore.saveArtifact(capturedBlob.value, activePackId, sparkIndex);
      savedArtifactId.value = artifact.id;
      state.value = 'spark';
    }
  }, 'image/png');
}
</script>

<template>
  <div class="capture-flow">
    <!-- Capture modal -->
    <div v-if="showCapture" class="capture-overlay">
      <div class="capture-content">
        <h2 class="capture-title">Capture this moment</h2>
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

        <button 
          v-if="isDevelopment"
          class="dev-skip-button"
          @click="skipToSparkLine"
          :disabled="loading"
        >
          [DEV] Skip to Spark
        </button>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Landing animation with ghost mosaic -->
    <GhostMosaicOverlay
      v-if="showLanding"
      ref="ghostMosaicRef"
      :artifacts="artifactStore.currentWeekArtifacts"
      :target-artifact-id="savedArtifactId"
      :captured-image-url="capturedPreviewUrl"
      :show="showLanding"
      :show-new-capture="showNewCapture"
      :fade-to-black="fadeToBlack"
      @ready="handleGhostMosaicReady"
    />

    <!-- Spark line view -->
    <SparkLine 
      v-if="showSparkLine"
      :spark-line="sparkLine"
      @done="handleDone"
    />
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

.dev-skip-button {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--muted);
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: monospace;
  opacity: 0.6;
  margin-top: 12px;
}

.dev-skip-button:hover:not(:disabled) {
  opacity: 1;
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(43, 76, 126, 0.05);
}

.dev-skip-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 16px;
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
