<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { blobToDataURL } from '../utils/helpers';
import type { Artifact } from '../types';

interface Props {
  artifacts: Artifact[];
  targetArtifactId: string;
  capturedImageUrl: string; // Image URL to display in target tile
  show: boolean;
  showNewCapture?: boolean; // Whether to fade in the new capture
  fadeToBlack?: boolean; // Whether to fade background to black
}

const props = defineProps<Props>();
defineEmits<{
  ready: [];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const artifactImageUrls = ref<Map<string, string>>(new Map());

// Convert artifact blobs to data URLs when artifacts change
watch(
  () => props.artifacts,
  async (newArtifacts) => {
    const urls = new Map<string, string>();
    for (const artifact of newArtifacts) {
      if (!urls.has(artifact.id)) {
        const imageUrl = await blobToDataURL(artifact.blob);
        urls.set(artifact.id, imageUrl);
      }
    }
    artifactImageUrls.value = urls;
  },
  { immediate: true }
);

onMounted(() => {
  // Emit ready event when mounted
  if (containerRef.value) {
    // Ensure DOM is painted
    setTimeout(() => {
      const event = new Event('ready', { bubbles: true });
      containerRef.value?.dispatchEvent(event);
    }, 0);
  }
});
</script>

<template>
  <div
    v-if="show"
    ref="containerRef"
    class="ghost-mosaic-overlay"
    :class="{ 'fade-to-black': props.fadeToBlack }"
    @ready="$emit('ready')"
  >
    <div class="mosaic-grid">
      <div
        v-for="artifact in artifacts"
        :key="artifact.id"
        class="mosaic-tile"
        :class="{ 'target-tile': artifact.id === targetArtifactId }"
      >
        <img
          v-if="artifact.id === targetArtifactId"
          :src="capturedImageUrl"
          :alt="'Captured photo'"
          class="tile-image"
          :class="{ 'fade-in': props.showNewCapture }"
          :style="{ opacity: props.showNewCapture ? 1 : 0 }"
        />
        <img
          v-else
          :src="artifactImageUrls.get(artifact.id)"
          :alt="`Day ${artifact.isoDate}`"
          class="tile-image"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ghost-mosaic-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  background: rgba(246, 241, 231, 0.95);
  backdrop-filter: blur(0px);
  transition: background 2500ms ease-out, opacity 300ms ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 20px;
  overflow-y: auto;
  opacity: 0;
  animation: fadeInMosaic 300ms ease-out forwards;
}

@keyframes fadeInMosaic {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ghost-mosaic-overlay.fade-to-black {
  background: #000;
}

.ghost-mosaic-overlay.fade-to-black .mosaic-grid {
  opacity: 0;
}

.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 900px;
  opacity: 1;
  transition: opacity 2500ms ease-out;
}

.mosaic-tile {
  aspect-ratio: 1;
  background: #fff8ef;
  border: 4px solid #f6f1e7;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.mosaic-tile.target-tile {
  box-shadow: 0 4px 12px rgba(43, 76, 126, 0.15);
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tile-image.fade-in {
  opacity: 1;
  animation: fadeInCapture 600ms ease-out forwards;
}

@keyframes fadeInCapture {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
