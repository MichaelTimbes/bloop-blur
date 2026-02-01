<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArtifactStore } from '../stores/artifacts';
import { useTraceStore } from '../stores/trace';
import { useSettingsStore } from '../stores/settings';
import Interstitial from '../components/Interstitial.vue';
import CaptureFlow from '../components/CaptureFlow.vue';

const router = useRouter();
const artifactStore = useArtifactStore();
const traceStore = useTraceStore();
const settingsStore = useSettingsStore();
const isDevelopment = import.meta.env.DEV;

const showInterstitial = ref(false);
const showCapture = ref(false);
const isExpanding = ref(false);
const boopButton = ref<HTMLButtonElement | null>(null);
const expandOrigin = ref({ x: 0, y: 0 });

onMounted(() => {
  artifactStore.loadArtifacts();
});

async function handleBoop() {
  // Prevent multiple boops on same day (except in dev mode)
  if (!isDevelopment && artifactStore.hasBoopedToday) {
    return;
  }

  // Get button position for expansion origin
  if (boopButton.value) {
    const rect = boopButton.value.getBoundingClientRect();
    expandOrigin.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // Start expansion animation
  isExpanding.value = true;

  // Wait for expansion to complete (600ms)
  setTimeout(() => {
    // Show interstitial after expansion
    showInterstitial.value = true;

    // Wait for interstitial to finish (1-2 seconds)
    const duration = 1000 + Math.random() * 1000;
    setTimeout(() => {
      showInterstitial.value = false;
      showCapture.value = true;
      // Keep isExpanding true to maintain background
    }, duration);
  }, 600);
}

function handleCaptureComplete() {
  showCapture.value = false;
  isExpanding.value = false;
  traceStore.recordBoop();
}

function handleCaptureCancel() {
  showCapture.value = false;
  isExpanding.value = false;
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1 class="app-title">Boop-Blur</h1>
      <nav class="home-nav">
        <RouterLink to="/mosaic" class="nav-link">Mosaic</RouterLink>
        <RouterLink to="/settings" class="nav-link">Settings</RouterLink>
      </nav>
    </header>

    <main class="home-main">
      <div class="boop-container">
        <button 
          ref="boopButton"
          class="boop-button" 
          :class="{ 'hiding': isExpanding }"
          @click="handleBoop"
          :disabled="(!isDevelopment && artifactStore.hasBoopedToday) || showInterstitial || showCapture || isExpanding"
        >
          I'm here
        </button>
        
        <p v-if="!isDevelopment && artifactStore.hasBoopedToday" class="already-booped">
          ✓ You've already booped today
        </p>
      </div>

      <div class="stats">
        <p class="stat-item">Total boops: {{ traceStore.trace.totalBoops }}</p>
      </div>
    </main>

    <!-- Expanding background overlay -->
    <div 
      v-if="isExpanding"
      class="expand-overlay"
      :style="{
        '--expand-x': expandOrigin.x + 'px',
        '--expand-y': expandOrigin.y + 'px'
      }"
    ></div>

    <Interstitial v-if="showInterstitial" />
    <CaptureFlow 
      v-if="showCapture"
      @complete="handleCaptureComplete"
      @cancel="handleCaptureCancel"
    />
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--bg);
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.home-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text);
}

.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.boop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.boop-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, color 0.3s;
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
}

.boop-button.hiding {
  color: transparent;
}

.boop-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

.boop-button:active:not(:disabled) {
  transform: scale(0.95);
}

.boop-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.already-booped {
  color: var(--accent);
  font-size: 14px;
}

.stats {
  color: var(--muted);
  font-size: 14px;
}

.stat-item {
  margin: 0;
}

.expand-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--accent);
  z-index: 998;
  animation: circularExpand 1.618s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  clip-path: circle(0% at var(--expand-x) var(--expand-y));
}

@keyframes circularExpand {
  0% {
    clip-path: circle(0% at var(--expand-x) var(--expand-y));
  }
  100% {
    clip-path: circle(150% at var(--expand-x) var(--expand-y));
  }
}

@keyframes expandToScreen {
  0% {
    transform: scale(1);
    border-radius: 50%;
  }
  100% {
    transform: scale(15);
    border-radius: 0%;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 15px;
  }

  .app-title {
    font-size: 20px;
  }

  .home-nav {
    gap: 15px;
  }

  .nav-link {
    font-size: 14px;
  }

  .boop-button {
    width: 160px;
    height: 160px;
    font-size: 20px;
  }
}
</style>
