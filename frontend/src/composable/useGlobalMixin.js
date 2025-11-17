import { useQuasar } from 'quasar';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export function useGlobMixin() {
  const $store = useStore();
  const $route = useRoute();
  const $router = useRouter();
  const $q = useQuasar();
  const { t } = useI18n();
  const isDev = process.env.DEV || process.env.NODE_ENV === 'development';
  const isAdmin = computed(() => $store.getters['auth/user']?.role === 'admin');
  const isPwaMode = (import.meta.env.VITE_BUILD_TARGET || 'pwa') === 'pwa';

  return {
    $q,
    $store,
    $route,
    $router,
    t,
    isDev,
    isAdmin,
    isPwaMode,
  };
}
