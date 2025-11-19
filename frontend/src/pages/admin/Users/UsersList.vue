<template>
  <q-table
    flat
    ref="tableRef"
    :rows="rows"
    :columns="columns"
    row-key="id"
    v-model:pagination="paginationLocal"
    :loading="loading"
    :filter="filter"
    binary-state-sort
    @request="debouncedRequest"
    @row-click="clickRow"
  >
    <template v-slot:top-right>
      <q-input
        dense
        filled
        debounce="300"
        v-model="filter"
        :placeholder="t('search')"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
  <q-page-sticky position="bottom-right" :offset="[38, 38]">
    <q-btn fab icon="add" color="primary" :to="{ name: 'user-create' }" />
  </q-page-sticky>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { debounce } from 'quasar';

const { $store, t, $router } = useGlobMixin();

const loading = ref(false);
const tableRef = ref(null);
const filter = ref('');

const rows = computed(() => $store.getters['adminUsers/users'] ?? []);

const paginationLocal = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: null,
  descending: false,
});

const storeMeta = computed(() => $store.getters['adminUsers/pagination'] ?? {});

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

const columns = [
  {
    name: 'fullName',
    field: row => row.lastName + ' ' + row.firstName,
    label: ' ',
    align: 'left',
    sortable: true,
  },
  {
    name: 'companyName',
    field: row => row.company?.name,
    label: t('company'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'role',
    field: 'role',
    label: 'role',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    field: 'email',
    label: 'email',
    align: 'left',
    sortable: true,
  },

  {
    name: 'status',
    field: 'status',
    label: 'status',
    align: 'left',
    sortable: true,
  },
];

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
    await $store.dispatch('adminUsers/getUsers', {
      page,
      limit: rowsPerPage,
      sortBy,
      order: descending ? 'desc' : 'asc',
      search,
    });

    const meta = $store.getters['adminUsers/pagination'] ?? {};
    paginationLocal.value.rowsNumber =
      meta.total ?? paginationLocal.value.rowsNumber;
    paginationLocal.value.page = meta.page ?? page;
    paginationLocal.value.rowsPerPage = meta.limit ?? rowsPerPage;
    paginationLocal.value.sortBy = sortBy;
    paginationLocal.value.descending = descending;
  } catch (err) {
    console.error('onRequest error', err);
  } finally {
    loading.value = false;
  }
}

const clickRow = (evt, row) => {
  $router.push({ name: 'user-edit', params: { id: row.id } });
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
</script>
