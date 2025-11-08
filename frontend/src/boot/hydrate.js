import { boot } from 'quasar/wrappers';
import store from '@/store';

export default boot(async () => {
  const buildTarget = import.meta.env.VITE_BUILD_TARGET;

  if (buildTarget === 'pwa') {
    setTimeout(async () => {
      try {
        if (store.state.pwaTemplates) {
          await store.dispatch('pwaTemplates/hydrateFromDB');
        }

        if (store.state.pwaFilters) {
          store.dispatch('pwaFilters/hydrateFromLocalStorage');
        }

        if (store.state.pwaAudits) {
          await store.dispatch('pwaAudits/hydrateFromDB');
        }
      } catch (error) {
        console.error('Hydration error:', error);
      }
    }, 100);
  }
});
