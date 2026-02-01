<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRandomItem } from '../utils/helpers';

// Silly interstitial messages
const messages = [
  "beep boop...",
  "loading feelings...",
  "calibrating existence...",
  "vibes loading...",
  "reality check in progress...",
  "summoning presence...",
  "activating human mode...",
  "being detected...",
  "consciousness: online",
  "existential status: vibing",
  "you are here (probably)",
  "processing realness...",
  "manifestation imminent...",
  "presence confirmed",
  "booping the void..."
];

const currentMessage = ref('');

onMounted(() => {
  currentMessage.value = getRandomItem(messages);
});
</script>

<template>
  <div class="interstitial">
    <p class="interstitial-message">{{ currentMessage }}</p>
  </div>
</template>

<style scoped>
.interstitial {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--accent);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in;
}

.interstitial-message {
  color: white;
  font-size: 24px;
  font-weight: 500;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .interstitial-message {
    font-size: 18px;
    padding: 0 20px;
    text-align: center;
  }
}
</style>
