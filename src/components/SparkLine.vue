<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{
  sparkLine: string;
}>();

const emit = defineEmits<{
  done: [];
}>();

const mounted = ref(false);

onMounted(() => {
  // Small delay to ensure animation triggers
  mounted.value = true;
});

function handleDone() {
  emit('done');
}
</script>

<template>
  <div class="spark-line-container">
    <div class="spark-line-content">
      <div class="spark-box">
        <p class="spark-line-text">{{ sparkLine }}</p>
      </div>
      <button class="done-button" @click="handleDone">
        Done
      </button>
    </div>
  </div>
</template>

<style scoped>
.spark-line-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spark-line-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 500px;
  opacity: 0;
  animation: fadeInSparkLine 1500ms ease-out forwards;
}

.spark-box {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid white;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  backdrop-filter: blur(10px);
}

.spark-line-text {
  font-size: 20px;
  line-height: 1.6;
  color: white;
  text-align: center;
  font-style: italic;
  margin: 0;
}

.done-button {
  padding: 16px 40px;
  border: 2px solid white;
  border-radius: 8px;
  background: transparent;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.done-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .spark-line-text {
    font-size: 18px;
  }

  .spark-box {
    padding: 30px 20px;
  }

  .done-button {
    padding: 12px 30px;
    font-size: 14px;
  }
}

@keyframes fadeInSparkLine {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
