import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { firebaseConfig, ENABLE_AUTH } from '../config';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  // Initialize Firebase Auth
  async function initAuth() {
    if (!ENABLE_AUTH) return;

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Listen for auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
    });
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    if (!ENABLE_AUTH) return;

    loading.value = true;
    error.value = null;

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string) {
    if (!ENABLE_AUTH) return;

    loading.value = true;
    error.value = null;

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
    } catch (err: any) {
      error.value = err.message || 'Failed to sign up';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Sign out
  async function logOut() {
    if (!ENABLE_AUTH) return;

    loading.value = true;
    error.value = null;

    try {
      const auth = getAuth();
      await signOut(auth);
      user.value = null;
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initAuth,
    signIn,
    signUp,
    logOut
  };
});
