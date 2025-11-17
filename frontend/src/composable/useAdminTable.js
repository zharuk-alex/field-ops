import { ref, computed, watch, onMounted } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { debounce } from 'quasar';

export function useAdminTable(config) {
  const {
    storeModule,
    getterName,
    actionName,
    editRouteName,
    columns = [],
    initialSort = null,
  } = config;

  const { $store, t, $router, $route } = useGlobMixin();

  const loading = ref(false);
  const tableRef = ref(null);
  const filter = ref('');

  const rows = computed(
    () => $store.getters[`${storeModule}/${getterName}`] ?? [],
  );

  const paginationLocal = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    sortBy: initialSort?.sortBy || null,
    descending: initialSort?.descending ?? false,
  });

  const storeMeta = computed(
    () => $store.getters[`${storeModule}/pagination`] ?? {},
  );

  watch(
    storeMeta,
    meta => {
      if (!meta) return;
      paginationLocal.value.rowsNumber =
        meta.total ?? paginationLocal.value.rowsNumber;
      paginationLocal.value.page = meta.page ?? paginationLocal.value.page;
      paginationLocal.value.rowsPerPage =
        meta.limit ?? paginationLocal.value.rowsPerPage;
    },
    { immediate: true },
  );

  watch(filter, () => {
    if (
      tableRef.value &&
      typeof tableRef.value.requestServerInteraction === 'function'
    ) {
      tableRef.value.requestServerInteraction();
    }
  });

  async function onRequest(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    const search = props.filter ?? '';

    loading.value = true;
    try {
      await $store.dispatch(`${storeModule}/${actionName}`, {
        page,
        limit: rowsPerPage,
        sortBy,
        order: descending ? 'desc' : 'asc',
        search,
      });

      const meta = $store.getters[`${storeModule}/pagination`] ?? {};
      paginationLocal.value.rowsNumber =
        meta.total ?? paginationLocal.value.rowsNumber;
      paginationLocal.value.page = meta.page ?? page;
      paginationLocal.value.rowsPerPage = meta.limit ?? rowsPerPage;
      paginationLocal.value.sortBy = sortBy;
      paginationLocal.value.descending = descending;

      await $router.push({
        path: $route.path,
        query: { ...paginationLocal.value },
      });
    } catch (err) {
      console.error(`${storeModule}/${actionName} error:`, err);
    } finally {
      loading.value = false;
    }
  }

  const clickRow = (evt, row) => {
    if (editRouteName && row.id) {
      $router.push({ name: editRouteName, params: { id: String(row.id) } });
    }
  };

  const debouncedRequest = debounce(onRequest, 300);

  onMounted(() => {
    if (
      tableRef.value &&
      typeof tableRef.value.requestServerInteraction === 'function'
    ) {
      tableRef.value.requestServerInteraction();
    } else {
      onRequest({ pagination: paginationLocal.value, filter: filter.value });
    }
  });

  return {
    loading,
    tableRef,
    filter,
    rows,
    paginationLocal,
    columns,

    onRequest,
    clickRow,
    debouncedRequest,

    t,
    $router,
  };
}
