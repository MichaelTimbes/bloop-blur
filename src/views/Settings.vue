<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useTraceStore } from '../stores/trace';
import { useArtifactStore } from '../stores/artifacts';
import type { DeletionPolicy } from '../types';

const router = useRouter();
const settingsStore = useSettingsStore();
const traceStore = useTraceStore();
const artifactStore = useArtifactStore();

const vibePacks = [
  { id: 'zen-but-dumb', name: 'Zen but Dumb' },
  { id: 'existential-but-cozy', name: 'Existential but Cozy' },
  { id: 'relational-nudges', name: 'Relational Nudges' },
  { id: 'existential-but-mundane', name: 'Existential but Mundane' },
  { id: 'nature-but-unhinged', name: 'Nature but Unhinged' }
];

const deletionPolicies: { value: DeletionPolicy; label: string; description: string }[] = [
  { value: 'off', label: 'Off', description: 'Keep all artifacts forever' },
  { value: 'keep-4-weeks', label: 'Keep 4 weeks', description: 'Delete artifacts older than 28 days' },
  { value: 'delete-14-days', label: 'Delete 14 days', description: 'Delete artifacts older than 14 days' }
];

const showClearModal = ref(false);

function handleVibePackChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  settingsStore.setActiveVibePack(select.value);
}

function handleDeletionPolicyChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  settingsStore.setDeletionPolicy(select.value as DeletionPolicy);
}

function goBack() {
  router.push('/');
}

function openClearModal() {
  showClearModal.value = true;
}

function closeClearModal() {
  showClearModal.value = false;
}

async function confirmClearAllArtifacts() {
  await artifactStore.clearAll();
  traceStore.reset();
  settingsStore.reset();
  closeClearModal();
  router.push('/');
}
</script>

<template>
  <div class="settings">
    <header class="settings-header">
      <button class="back-button" @click="goBack">
        ← Back
      </button>
      <h1 class="settings-title">Settings</h1>
    </header>

    <main class="settings-main">
      <section class="settings-section">
        <h2 class="section-title">Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total Boops</span>
            <span class="stat-value">{{ traceStore.trace.totalBoops }}</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Vibe Pack</h2>
        <p class="section-description">
          Choose which set of spark lines you'll see after each boop
        </p>
        <select
          class="settings-select"
          :value="settingsStore.settings.activeVibePack"
          @change="handleVibePackChange"
        >
          <option
            v-for="pack in vibePacks"
            :key="pack.id"
            :value="pack.id"
          >
            {{ pack.name }}
          </option>
        </select>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Deletion Policy</h2>
        <p class="section-description">
          Automatically delete old artifacts to keep things ephemeral
        </p>
        <select
          class="settings-select"
          :value="settingsStore.settings.deletionPolicy"
          @change="handleDeletionPolicyChange"
        >
          <option
            v-for="policy in deletionPolicies"
            :key="policy.value"
            :value="policy.value"
          >
            {{ policy.label }}
          </option>
        </select>
        <p class="policy-description">
          {{
            deletionPolicies.find(
              p => p.value === settingsStore.settings.deletionPolicy
            )?.description
          }}
        </p>
      </section>

      <section class="settings-section">
        <h2 class="section-title">About</h2>
        <p class="about-text">
          Boop-Blur is a tiny, local-first web app that helps you feel real again
          with a daily check-in. Your artifacts are stored locally and decay over
          time like memories.
        </p>
        <p class="about-text version">
          Version 0.1.0
        </p>
      </section>

      <section class="settings-section danger-section">
        <h2 class="section-title">Danger Zone</h2>
        <p class="section-description">
          Permanently delete all artifacts, reset your boop counter, and clear all settings.
        </p>
        <button class="danger-button" @click="openClearModal">
          Clear All Artifacts
        </button>
      </section>
    </main>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearModal" class="modal-overlay" @click="closeClearModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">Clear All Artifacts?</h2>
        <p class="modal-message">
          This will permanently delete all your artifacts and reset your boop counter to 0. This action cannot be undone.
        </p>
        <div class="modal-buttons">
          <button class="modal-button cancel-button" @click="closeClearModal">
            Cancel
          </button>
          <button class="modal-button danger-confirm-button" @click="confirmClearAllArtifacts">
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg);
}

.settings-header {
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

.settings-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.settings-main {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 2px solid rgba(110, 106, 95, 0.2);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.section-description {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 16px;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--accent);
  padding: 20px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.settings-select {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(110, 106, 95, 0.3);
  border-radius: var(--radius);
  background: var(--panel);
  font-size: 16px;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s;
}

.settings-select:hover {
  border-color: var(--accent);
}

.settings-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(43, 76, 126, 0.1);
}

.policy-description {
  margin-top: 8px;
  font-size: 13px;
  color: var(--muted);
  opacity: 0.8;
  font-style: italic;
}

.about-text {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 12px;
}

.about-text.version {
  color: var(--muted);
  opacity: 0.6;
  font-size: 12px;
}

.danger-section {
  border-bottom-color: #d97777;
}

.danger-button {
  padding: 12px 20px;
  border: 2px solid #d97777;
  border-radius: var(--radius);
  background: transparent;
  color: #d97777;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.danger-button:hover {
  background: rgba(217, 119, 119, 0.1);
  border-color: #c45555;
  color: #c45555;
}

/* Clear Modal */
.modal-overlay {
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

.modal-content {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 32px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #d97777;
  margin: 0;
}

.modal-message {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  margin: 0;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.modal-button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--muted);
  border-radius: var(--radius);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-button.cancel-button {
  color: var(--muted);
}

.modal-button.cancel-button:hover {
  background: rgba(110, 106, 95, 0.1);
  border-color: var(--text);
  color: var(--text);
}

.modal-button.danger-confirm-button {
  border-color: #d97777;
  color: #d97777;
}

.modal-button.danger-confirm-button:hover {
  background: rgba(217, 119, 119, 0.1);
  border-color: #c45555;
  color: #c45555;
}

@media (max-width: 768px) {
  .settings {
    padding: 15px;
  }

  .settings-title {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
