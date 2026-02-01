<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useArtifactStore } from './stores/artifacts';
import { ENABLE_AUTH } from './config';

const router = useRouter();
const authStore = useAuthStore();
const artifactStore = useArtifactStore();

onMounted(async () => {
  // Run cleanup job on app start
  await artifactStore.runCleanupJob();

  // Initialize auth if enabled
  if (ENABLE_AUTH) {
    await authStore.initAuth();
    
    // Redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      router.push('/login');
    }
  }
});
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
