<script setup lang="ts">
defineProps<{
  sparkLine: string;
}>();

const emit = defineEmits<{
  done: [];
}>();

function handleDone() {
  emit('done');
}
</script>

<template>
  <div class="spark-line-container">
    <div class="spark-line-content">
      <p class="spark-line-text">{{ sparkLine }}</p>
      <button class="done-button" @click="handleDone">
        Done
      </button>
    </div>
  </div>
</template>

<style scoped>
.spark-line-container {
  width: 100%;
}

.spark-line-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.spark-line-text {
  font-size: 20px;
  line-height: 1.6;
  color: var(--text);
  text-align: center;
  font-style: italic;
  margin: 0;
}

.done-button {
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
}

.done-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

@media (max-width: 768px) {
  .spark-line-text {
    font-size: 18px;
  }
}
</style>
