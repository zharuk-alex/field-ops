<template>
  <q-table
    flat
    ref="tableRef"
    title="Locations"
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
    <template v-slot:body-cell-gps="props">
      <q-td :props="props" class="text-center">
        <q-btn
          v-if="props.row.lat && props.row.lng"
          dense
          flat
          round
          size="sm"
          @click.stop="openMap(props.row)"
        >
          <q-icon name="place" />
          <q-tooltip>GPS: {{ props.row.lat }}, {{ props.row.lng }}</q-tooltip>
        </q-btn>

        <q-icon v-else name="location_off" class="text-grey-5" />
      </q-td>
    </template>
  </q-table>
  <q-page-sticky position="bottom-right" :offset="[38, 38]">
    <q-btn fab icon="add" color="primary" :to="{ name: 'location-create' }" />
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

const rows = computed(() => $store.getters['adminLocations/locations'] ?? []);

const paginationLocal = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: null,
  descending: false,
});

const columns = [
  {
    name: 'name',
    field: 'name',
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
    name: 'address',
    field: 'address',
    label: 'address',
    align: 'left',
    sortable: false,
  },
  {
    name: 'gps',
    field: row => !!(row.lat && row.lng),
    label: 'GPS',
    align: 'center',
    sortable: false,
  },
  {
    name: 'status',
    field: 'status',
    label: 'status',
    align: 'left',
    sortable: true,
  },
];

function openMap(row) {
  const url = `https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lng}#map=18/${row.lat}/${row.lng}`;
  window.open(url, '_blank');
}

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
    await $store.dispatch('adminLocations/getLocations', {
      page,
      limit: rowsPerPage,
      sortBy,
      order: descending ? 'desc' : 'asc',
      search,
    });

    const meta = $store.getters['adminLocations/pagination'] ?? {};
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
  $router.push({ name: 'location-edit', params: { id: row.id } });
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
