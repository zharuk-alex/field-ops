import { useRoute } from 'vue-router';
import { computed } from 'vue';

export function useBreadcrumbs(i18nT) {
  const route = useRoute();

  const crumbs = computed(() => {
    return route.matched
      .filter(r => r.meta && (r.meta.title || r.meta.i18n))
      .map(record => {
        const titleMeta = record.meta.title;
        const i18nKey = record.meta.i18n;

        const label =
          typeof titleMeta === 'function'
            ? titleMeta(route)
            : i18nKey && i18nT
              ? i18nT(i18nKey)
              : (titleMeta ?? (record.name || ''));

        let to = record.path;
        try {
          if (record.name) {
            to = { name: record.name, params: route.params };
          }
        } catch (e) {
          console.log(e);
        }

        return { label, to };
      });
  });

  return { crumbs };
}
