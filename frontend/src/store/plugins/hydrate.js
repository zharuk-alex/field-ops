const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`;

import { LocalStorage } from 'quasar';

export default function hydrate(store) {
  try {
    const token = LocalStorage.getItem(TOKEN_KEY);
    if (token) store.commit('auth/setToken', token);

    const dark_mode = LocalStorage.getItem('dark_mode') || false;
    store.commit('uiServices/SET_DARK_MODE', dark_mode);
  } catch (error) {
    console.error(error);
  }
}
