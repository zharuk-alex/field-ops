import { defineBoot } from '#q-app/wrappers';
import axios from 'axios';
import store from '@/store';

function trimEnd(s) {
  return s ? s.replace(/\/+$/, '') : s;
}
const base = trimEnd(import.meta.env.VITE_API_BASE_URL) || '';

export const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default defineBoot(({ app, router }) => {
  api.interceptors.request.use(config => {
    const token = store.getters['auth/bearer'];
    if (token) config.headers.Authorization = token;
    return config;
  });

  api.interceptors.response.use(
    r => r,
    async err => {
      if (err?.response?.status === 401) {
        store.dispatch('auth/logout');
        router.push({ name: 'login' });
      }
      return Promise.reject(err);
    },
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});
