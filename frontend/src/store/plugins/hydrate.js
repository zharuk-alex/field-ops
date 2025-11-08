const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`;

import { LocalStorage } from 'quasar';

export default function hydrate(store) {
  try {
    const token = LocalStorage.getItem(TOKEN_KEY);
    if (token) store.commit('auth/setToken', token);
  } catch (error) {
    console.error(error);
  }
}
