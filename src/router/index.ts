import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ENABLE_AUTH } from '../config';
import Home from '../views/Home.vue';
import Mosaic from '../views/Mosaic.vue';
import Settings from '../views/Settings.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: ENABLE_AUTH }
  },
  {
    path: '/mosaic',
    name: 'mosaic',
    component: Mosaic,
    meta: { requiresAuth: ENABLE_AUTH }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: ENABLE_AUTH }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  if (!ENABLE_AUTH) {
    next();
    return;
  }

  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
