<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ENABLE_AUTH } from '../config';

// Redirect if auth is disabled
if (!ENABLE_AUTH) {
  const router = useRouter();
  router.push('/');
}

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const isSignUp = ref(false);
const error = ref('');

async function handleSubmit() {
  error.value = '';

  if (!email.value || !password.value) {
    error.value = 'Please enter email and password';
    return;
  }

  try {
    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value);
    } else {
      await authStore.signIn(email.value, password.value);
    }
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Authentication failed';
  }
}

function toggleMode() {
  isSignUp.value = !isSignUp.value;
  error.value = '';
}
</script>

<template>
  <div class="login">
    <div class="login-container">
      <h1 class="login-title">{{ isSignUp ? 'Sign Up' : 'Sign In' }}</h1>
      <p class="login-subtitle">Boop-Blur</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button
          type="submit"
          class="submit-button"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In' }}
        </button>

        <button
          type="button"
          class="toggle-button"
          @click="toggleMode"
        >
          {{ isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
        </button>
      </form>

      <p class="privacy-note">
        Your artifacts are stored locally only. Authentication is just for login.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: var(--accent);
}

.login-container {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow);
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  color: var(--muted);
  text-align: center;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.form-input {
  padding: 12px;
  border: 2px solid rgba(110, 106, 95, 0.3);
  border-radius: var(--radius);
  font-size: 16px;
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(43, 76, 126, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.submit-button {
  padding: 14px;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-button {
  padding: 10px;
  border: none;
  background: none;
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.toggle-button:hover {
  opacity: 0.7;
}

.privacy-note {
  margin-top: 24px;
  font-size: 12px;
  color: var(--muted);
  opacity: 0.7;
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .login-container {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
