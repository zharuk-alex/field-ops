<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useGlobMixin } from './composable/useGlobalMixin'
import { useI18n } from 'vue-i18n';

const { $store, $q } = useGlobMixin()
const { locale } = useI18n({ useScope: 'global' });

const handleOnlineStatus = () => $store.commit('uiServices/isOnline', navigator.onLine)
const ensurePersistence = async function () {
  if (navigator.storage?.persist) {
    const already = await navigator.storage.persisted()
    if (!already) await navigator.storage.persist()
  }
}

const setLocale = async () => {
  const lang = $store.getters['text/userLang'];
  if (lang) {
    locale.value = lang;
    $q.lang.set(lang);
  }
};

onMounted(async () => {
  await ensurePersistence()
  await setLocale();

  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
  handleOnlineStatus()
})
</script>
