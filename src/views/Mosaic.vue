<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArtifactStore } from '../stores/artifacts';
import { blobToDataURL } from '../utils/helpers';
import { getAgeDays, getWeekStart } from '../utils/date';
import { DECAY_THRESHOLDS } from '../config';
import type { Artifact } from '../types';

// Import all vibe packs
import zenButDumb from '../content/packs/zen-but-dumb.json';
import existentialButCozy from '../content/packs/existential-but-cozy.json';
import relationalNudges from '../content/packs/relational-nudges.json';
import existentialButMundane from '../content/packs/existential-but-mundane.json';
import natureButUnhinged from '../content/packs/nature-but-unhinged.json';

const router = useRouter();
const artifactStore = useArtifactStore();

interface ArtifactWithImage extends Artifact {
  imageUrl: string;
  ageDays: number;
}

const artifactsWithImages = ref<ArtifactWithImage[]>([]);
const loading = ref(false);
const viewerOpen = ref(false);
const viewerArtifact = ref<ArtifactWithImage | null>(null);
const peekArtifactId = ref<string | null>(null);
const peekTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const pixelatedCanvases = new Map<string, HTMLCanvasElement>();

// DEV flag
const isDevelopment = import.meta.env.DEV;

// Map of vibe pack IDs to their content
const vibePacks: Record<string, string[]> = {
  'zen-but-dumb': zenButDumb,
  'existential-but-cozy': existentialButCozy,
  'relational-nudges': relationalNudges,
  'existential-but-mundane': existentialButMundane,
  'nature-but-unhinged': natureButUnhinged
};

onMounted(async () => {
  await loadMosaicArtifacts();
  
  // Handle Esc key to close viewer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewerOpen.value) {
      closeViewer();
    }
  });
});

// Computed week info for header
const weekStart = computed(() => getWeekStart());
const weekStartFormatted = computed(() => {
  const date = weekStart.value;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
});

// Compute week decay progress (0-1) based on current day of week
const weekDecayProgress = computed(() => {
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday
  // Convert to ISO week (Monday = 0, Sunday = 6)
  const isoDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return isoDayIndex / 6;
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

    // Sort by timestamp (newest first)
    artifactsWithImages.value = withImages.sort((a, b) => b.ts - a.ts);
  } finally {
    loading.value = false;
  }
}

// DEV: Create test artifacts with different ages to test blur effects
async function createTestArtifacts() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Create 7 artifacts spanning 7 days:
  // Age 1d created today (age ~0 days)
  // Age 7d created 7 days ago (age ~7 days)
  const promises: Promise<void>[] = [];
  
  for (let age = 1; age <= 7; age++) {
    // Create a colorful test image
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    
    // Different color for each age
    const hue = (age * 20) % 360;
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(0, 0, 300, 300);
    
    // Add text label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${age}`, 150, 150);
    
    // Wait for blob conversion and save
    const promise = new Promise<void>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (blob) {
          // First artifact (age 1) is created today, each subsequent is 1 day older
          const testTs = now - ((age - 1) * dayMs);
          await artifactStore.saveArtifact(blob, 'zen-but-dumb', 0, testTs);
        }
        resolve();
      }, 'image/png');
    });
    
    promises.push(promise);
  }
  
  // Wait for all artifacts to be created
  await Promise.all(promises);
  
  // Reload to display new artifacts
  await loadMosaicArtifacts();
}

function goBack() {
  router.push('/');
}

// Render pixelated version of an image on canvas (stable, cached)
function renderPixelated(canvas: HTMLCanvasElement | null, imageUrl: string, artifactId: string) {
  if (!canvas) return;

  // Check if already rendered
  if (pixelatedCanvases.has(artifactId)) {
    const cached = pixelatedCanvases.get(artifactId);
    if (cached) {
      canvas.width = cached.width;
      canvas.height = cached.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(cached, 0, 0);
      }
      return;
    }
  }

  const img = new Image();
  img.onload = () => {
    const pixelSize = 24;
    const displaySize = 300;

    canvas.width = displaySize;
    canvas.height = displaySize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelSize;
    tempCanvas.height = pixelSize;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0, pixelSize, pixelSize);
    ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);

    // Cache the result
    pixelatedCanvases.set(artifactId, canvas);
  };
  img.src = imageUrl;
}

// Get spark line for artifact
function getSparkLineForArtifact(artifact: ArtifactWithImage): string {
  const pack = vibePacks[artifact.sparkPackId] || vibePacks['zen-but-dumb'];
  return pack?.[artifact.sparkIndex] || 'Here you are.';
}

// Long-press peek handling
function handlePointerDown(artifactId: string) {
  // Cancel any existing peek
  if (peekTimeout.value) {
    clearTimeout(peekTimeout.value);
  }

  // Start peek timer (350ms threshold)
  peekTimeout.value = setTimeout(() => {
    peekArtifactId.value = artifactId;
    // Auto-clear peek after 1000ms
    setTimeout(() => {
      peekArtifactId.value = null;
    }, 1000);
  }, 350);
}

function handlePointerUp() {
  if (peekTimeout.value) {
    clearTimeout(peekTimeout.value);
    peekTimeout.value = null;
  }
}

// Modal handlers
function openViewer(artifact: ArtifactWithImage) {
  // Only open if not in peek state
  if (peekArtifactId.value === null) {
    viewerArtifact.value = artifact;
    viewerOpen.value = true;
  }
  handlePointerUp();
}

function closeViewer() {
  viewerOpen.value = false;
  viewerArtifact.value = null;
}

// Override decay for peek state
function getDecayStyleWithPeek(ageDays: number, artifactId: string): Record<string, string> {
  if (peekArtifactId.value === artifactId) {
    return {}; // No decay during peek
  }
  return getDecayStyle(ageDays);
}

function shouldPixelateWithPeek(ageDays: number, artifactId: string): boolean {
  if (peekArtifactId.value === artifactId) {
    return false; // No pixelation during peek
  }
  return shouldPixelate(ageDays);
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
      <div class="header-center">
        <h1 class="mosaic-title">Week of {{ weekStartFormatted }}</h1>
        <div class="decay-progression">
          <div class="decay-sample">
            <div class="sample-box" style="filter: none;"></div>
            <span class="sample-label">Day 0</span>
          </div>
          <div class="decay-sample">
            <div class="sample-box" style="filter: blur(1px);"></div>
            <span class="sample-label">Days 1-2</span>
          </div>
          <div class="decay-sample">
            <div class="sample-box" style="filter: blur(2px) saturate(0.8);"></div>
            <span class="sample-label">Days 3-4</span>
          </div>
          <div class="decay-sample">
            <div class="sample-box" style="filter: blur(3px) saturate(0.6) contrast(0.9);"></div>
            <span class="sample-label">Days 5-6</span>
          </div>
          <div class="decay-sample pixelated-sample">
            <div class="sample-box"></div>
            <span class="sample-label">Days 7+</span>
          </div>
        </div>
      </div>
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
          @pointerdown="handlePointerDown(artifact.id)"
          @pointerup="handlePointerUp"
          @pointercancel="handlePointerUp"
          @pointerleave="handlePointerUp"
          @click="openViewer(artifact)"
        >
          <canvas
            v-if="shouldPixelateWithPeek(artifact.ageDays, artifact.id)"
            :ref="el => renderPixelated(el as HTMLCanvasElement, artifact.imageUrl, artifact.id)"
            class="mosaic-image pixelated"
          />
          <img
            v-else
            :src="artifact.imageUrl"
            :alt="`Artifact from ${artifact.isoDate}`"
            class="mosaic-image"
            :style="getDecayStyleWithPeek(artifact.ageDays, artifact.id)"
          />
          <div class="artifact-info">
            <span class="artifact-date">{{ artifact.isoDate }}</span>
            <span class="artifact-age">{{ artifact.ageDays }}d old</span>
          </div>
        </div>
      </div>

      <!-- DEV: Test button -->
      <div v-if="isDevelopment" class="dev-section">
        <button class="dev-button" @click="createTestArtifacts">
          [DEV] Create Test Artifacts
        </button>
      </div>
    </main>

    <!-- Viewer Modal -->
    <div v-if="viewerOpen && viewerArtifact" class="viewer-modal" @click="closeViewer">
      <div class="viewer-content" @click.stop>
        <button class="viewer-close" @click="closeViewer">Back</button>
        <img :src="viewerArtifact.imageUrl" class="viewer-image" :style="getDecayStyle(viewerArtifact.ageDays)" />
        <p class="viewer-spark-line">{{ getSparkLineForArtifact(viewerArtifact) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contact sheet theme with paper texture */
.mosaic {
  min-height: 100vh;
  padding: 0;
  background-color: #faf8f3;
  background-image: 
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px);
  position: relative;
}

.mosaic-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  background: rgba(250, 248, 243, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(110, 106, 95, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  flex-shrink: 0;
}

.back-button:hover {
  background: var(--muted);
  color: white;
}

.header-center {
  flex: 1;
  text-align: center;
}

.mosaic-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
}

.mosaic-subtitle {
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 8px 0;
  opacity: 0.7;
}

.mosaic-subtitle {
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 8px 0;
  opacity: 0.7;
}

.decay-progression {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.decay-sample {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sample-box {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), rgba(43, 76, 126, 0.5));
  border: 1px solid rgba(110, 106, 95, 0.2);
  transition: filter 0.3s;
}

.decay-sample.pixelated-sample .sample-box {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  opacity: 0.75;
  background: linear-gradient(135deg, var(--bg), var(--panel));
  border: 1px solid;
  border-image: linear-gradient(135deg, rgba(110, 106, 95, 0.1), rgba(110, 106, 95, 0.05)) 1;
}

.sample-label {
  font-size: 11px;
  color: var(--text);
  opacity: 0.8;
  font-weight: 600;
  white-space: nowrap;
}

.decay-meter {
  display: none;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.decay-square {
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: rgba(110, 106, 95, 0.15);
  transition: background-color 0.3s;
}

.decay-square.filled {
  background: var(--accent);
}

.mosaic-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.mosaic-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: white;
  border: 6px solid #f5f3f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mosaic-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.mosaic-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
  display: block;
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

/* Viewer Modal */
.viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.viewer-content {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.viewer-close {
  align-self: flex-start;
  padding: 8px 16px;
  border: 2px solid var(--muted);
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.viewer-close:hover {
  background: var(--muted);
  color: white;
}

.viewer-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  transition: filter 0.3s;
}

.viewer-spark-line {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  font-style: italic;
  margin: 0;
  padding: 12px;
  background: rgba(43, 76, 126, 0.05);
  border-radius: 8px;
  border-left: 3px solid var(--accent);
}

/* DEV Section */
.dev-section {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
  border-top: 2px dashed var(--muted);
}

.dev-button {
  padding: 10px 16px;
  border: 2px dashed var(--muted);
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
}

.dev-button:hover {
  opacity: 1;
  background: rgba(110, 106, 95, 0.05);
}

@media (max-width: 768px) {
  .mosaic {
    padding: 0;
  }

  .mosaic-main {
    padding: 16px;
  }

  .mosaic-header {
    padding: 12px 16px;
    gap: 12px;
  }

  .back-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .mosaic-title {
    font-size: 16px;
  }

  .mosaic-subtitle {
    font-size: 12px;
  }

  .decay-square {
    width: 5px;
    height: 5px;
  }

  .mosaic-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .mosaic-item {
    border-width: 4px;
  }

  .artifact-info {
    padding: 8px;
    font-size: 10px;
  }

  .viewer-modal {
    padding: 16px;
  }

  .viewer-content {
    padding: 16px;
    max-height: 85vh;
  }

  .viewer-spark-line {
    font-size: 13px;
  }
}
</style>
