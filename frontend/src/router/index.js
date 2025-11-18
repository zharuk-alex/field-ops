import { defineRouter } from '#q-app/wrappers';
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import routesAdmin from '@/router/admin/routes';
import routesPwa from '@/router/pwa/routes';

import authCheck from './guards/authCheck.js';

const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET || 'pwa';
const routes = BUILD_TARGET === 'admin' ? routesAdmin : routesPwa;

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }
      if (to.hash) {
        return { el: to.hash, behavior: 'smooth' };
      }
      return { left: 0, top: 0 };
    },
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    try {
      const res = await authCheck(to);
      if (!res.allow) {
        return next(res.redirect);
      }
      return next();
    } catch (err) {
      console.error('Auth guard failed', err);
      return next({ name: 'login' });
    }
  });

  return Router;
});
