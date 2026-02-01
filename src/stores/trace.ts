import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getTrace, saveTrace, incrementBoops } from '../utils/storage';
import type { Trace } from '../types';

export const useTraceStore = defineStore('trace', () => {
  const trace = ref<Trace>(getTrace());

  function recordBoop() {
    incrementBoops();
    trace.value = getTrace();
  }

  function reset() {
    const newTrace: Trace = {
      totalBoops: 0,
      lastBoopTs: 0
    };
    saveTrace(newTrace);
    trace.value = newTrace;
  }

  return {
    trace,
    recordBoop,
    reset
  };
});
