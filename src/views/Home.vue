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

const showInterstitial = ref(false);
const showCapture = ref(false);

onMounted(() => {
  artifactStore.loadArtifacts();
});

async function handleBoop() {
  // Show interstitial
  showInterstitial.value = true;

  // Wait for interstitial to finish (1-2 seconds)
  const duration = 1000 + Math.random() * 1000;
  setTimeout(() => {
    showInterstitial.value = false;
    showCapture.value = true;
  }, duration);
}

function handleCaptureComplete() {
  showCapture.value = false;
  traceStore.recordBoop();
}

function handleCaptureCancel() {
  showCapture.value = false;
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
          class="boop-button" 
          @click="handleBoop"
          :disabled="showInterstitial || showCapture"
        >
          I'm here
        </button>
        
        <p v-if="artifactStore.hasBoopedToday" class="already-booped">
          ✓ You've already booped today
        </p>
      </div>

      <div class="stats">
        <p class="stat-item">Total boops: {{ traceStore.trace.totalBoops }}</p>
      </div>
    </main>

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
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow);
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
