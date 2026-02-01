<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArtifactStore } from '../stores/artifacts';
import { blobToDataURL } from '../utils/helpers';
import { getAgeDays } from '../utils/date';
import { DECAY_THRESHOLDS } from '../config';
import type { Artifact } from '../types';

const router = useRouter();
const artifactStore = useArtifactStore();

interface ArtifactWithImage extends Artifact {
  imageUrl: string;
  ageDays: number;
}

const artifactsWithImages = ref<ArtifactWithImage[]>([]);
const loading = ref(false);

onMounted(async () => {
  await loadMosaicArtifacts();
});

async function loadMosaicArtifacts() {
  loading.value = true;
  try {
    await artifactStore.loadArtifacts();
    const currentWeek = artifactStore.currentWeekArtifacts;
    const now = Date.now();

    // Convert blobs to data URLs and calculate age
    const withImages = await Promise.all(
      currentWeek.map(async (artifact) => {
        const imageUrl = await blobToDataURL(artifact.blob);
        const ageDays = getAgeDays(artifact.ts, now);
        return {
          ...artifact,
          imageUrl,
          ageDays
        };
      })
    );

    artifactsWithImages.value = withImages;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/');
}

// Calculate decay styles for each artifact based on age
function getDecayStyle(ageDays: number): Record<string, string> {
  const style: Record<string, string> = {};

  if (ageDays === DECAY_THRESHOLDS.crisp) {
    // Day 0: crisp, no effects
    return style;
  } else if (ageDays >= DECAY_THRESHOLDS.slightBlur && ageDays < DECAY_THRESHOLDS.moreBlur) {
    // Days 1-2: slight blur
    style.filter = 'blur(1px)';
  } else if (ageDays >= DECAY_THRESHOLDS.moreBlur && ageDays < DECAY_THRESHOLDS.heavyBlur) {
    // Days 3-4: more blur + slight desaturation
    style.filter = 'blur(2px) saturate(0.8)';
  } else if (ageDays >= DECAY_THRESHOLDS.heavyBlur && ageDays < DECAY_THRESHOLDS.pixelated) {
    // Days 5-6: heavy blur + more desaturation + lower contrast
    style.filter = 'blur(3px) saturate(0.6) contrast(0.9)';
  } else if (ageDays >= DECAY_THRESHOLDS.pixelated) {
    // Days 7+: pixelated effect (will be handled by canvas rendering)
    // No filter needed here as we'll render pixelated version
  }

  return style;
}

// Check if artifact should be pixelated (7+ days)
function shouldPixelate(ageDays: number): boolean {
  return ageDays >= DECAY_THRESHOLDS.pixelated;
}
</script>

<template>
  <div class="mosaic">
    <header class="mosaic-header">
      <button class="back-button" @click="goBack">
        ← Back
      </button>
      <h1 class="mosaic-title">This Week's Mosaic</h1>
    </header>

    <main class="mosaic-main">
      <div v-if="loading" class="loading">
        Loading...
      </div>

      <div v-else-if="artifactsWithImages.length === 0" class="empty-state">
        <p>No artifacts this week yet.</p>
        <p class="empty-subtitle">Tap "I'm here" to create your first one.</p>
      </div>

      <div v-else class="mosaic-grid">
        <div
          v-for="artifact in artifactsWithImages"
          :key="artifact.id"
          class="mosaic-item"
        >
          <canvas
            v-if="shouldPixelate(artifact.ageDays)"
            :ref="el => renderPixelated(el as HTMLCanvasElement, artifact.imageUrl)"
            class="mosaic-image pixelated"
          />
          <img
            v-else
            :src="artifact.imageUrl"
            :alt="`Artifact from ${artifact.isoDate}`"
            class="mosaic-image"
            :style="getDecayStyle(artifact.ageDays)"
          />
          <div class="artifact-info">
            <span class="artifact-date">{{ artifact.isoDate }}</span>
            <span class="artifact-age">{{ artifact.ageDays }}d old</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
/**
 * Render pixelated version of an image on canvas
 * Downscale to tiny size (24x24) then scale up with pixelated rendering
 */
function renderPixelated(canvas: HTMLCanvasElement | null, imageUrl: string) {
  if (!canvas) return;

  const img = new Image();
  img.onload = () => {
    const pixelSize = 24; // Downscale to 24x24 for pixelation effect
    const displaySize = 300; // Display size (will scale up)

    // Set canvas size
    canvas.width = displaySize;
    canvas.height = displaySize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw image downscaled to tiny size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelSize;
    tempCanvas.height = pixelSize;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw downscaled version
    tempCtx.drawImage(img, 0, 0, pixelSize, pixelSize);

    // Scale up to display size with pixelation
    ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
  };
  img.src = imageUrl;
}
</script>

<style scoped>
.mosaic {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg);
}

.mosaic-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-button {
  padding: 8px 16px;
  border: 2px solid var(--muted);
  border-radius: var(--radius);
  background: var(--panel);
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--muted);
  color: white;
}

.mosaic-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.mosaic-main {
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.empty-subtitle {
  margin-top: 10px;
  font-size: 14px;
  color: var(--muted);
  opacity: 0.7;
}

.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.mosaic-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.mosaic-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}

.mosaic-image.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.artifact-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
}

.artifact-date {
  font-weight: 500;
}

.artifact-age {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .mosaic {
    padding: 15px;
  }

  .mosaic-title {
    font-size: 20px;
  }

  .mosaic-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .artifact-info {
    padding: 8px;
    font-size: 10px;
  }
}
</style>
