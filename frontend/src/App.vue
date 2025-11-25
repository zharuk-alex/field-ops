<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useGlobMixin } from './composable/useGlobalMixin';
import { useNetworkStatus } from './composable/useNetworkStatus';
import { useI18n } from 'vue-i18n';

const { $store, $q } = useGlobMixin();
const { locale } = useI18n({ useScope: 'global' });

useNetworkStatus();

const ensurePersistence = async function () {
  if (navigator.storage?.persist) {
    const already = await navigator.storage.persisted();
    if (!already) await navigator.storage.persist();
  }
};

const setLocale = async () => {
  const lang = $store.getters['text/userLang'];
  if (lang) {
    locale.value = lang;
    $q.lang.set(lang);
  }
};

onMounted(async () => {
  await ensurePersistence();
  await setLocale();

  const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET || 'pwa';
  if (BUILD_TARGET === 'admin') {
    document.title = 'Field Ops Admin';
  }

  window.addEventListener('error', event => {
    if (
      event.message?.includes('Failed to fetch dynamically imported module')
    ) {
      if (!sessionStorage.getItem('page-reloaded')) {
        sessionStorage.setItem('page-reloaded', 'true');
        window.location.reload();
      }
    }
  });

  window.addEventListener('load', () => {
    sessionStorage.removeItem('page-reloaded');
  });
});
</script>
