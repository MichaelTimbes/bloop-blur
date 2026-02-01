<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useTraceStore } from '../stores/trace';
import type { DeletionPolicy } from '../types';

const router = useRouter();
const settingsStore = useSettingsStore();
const traceStore = useTraceStore();

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
    </main>
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
