<template>
  <div class="admin-table-wrapper">
    <q-table
      flat
      ref="tableRef"
      :title="title"
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

      <template
        v-for="slot in customBodyCellSlots"
        :key="slot"
        v-slot:[`body-cell-${slot}`]="slotProps"
      >
        <slot :name="`body-cell-${slot}`" :props="slotProps"></slot>
      </template>
    </q-table>

    <q-page-sticky
      v-if="createRouteName"
      position="bottom-right"
      :offset="[38, 38]"
    >
      <q-btn fab icon="add" color="primary" :to="{ name: createRouteName }" />
    </q-page-sticky>
  </div>
</template>

<script setup>
import { useAdminTable } from '@/composable/useAdminTable';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  storeModule: {
    type: String,
    required: true,
  },
  getterName: {
    type: String,
    required: true,
  },
  actionName: {
    type: String,
    required: true,
  },
  editRouteName: {
    type: String,
    default: null,
  },
  createRouteName: {
    type: String,
    default: null,
  },
  columns: {
    type: Array,
    required: true,
  },
  customBodyCellSlots: {
    type: Array,
    default: () => [],
  },
});

const {
  loading,
  tableRef,
  filter,
  rows,
  paginationLocal,
  debouncedRequest,
  clickRow,
  t,
} = useAdminTable({
  storeModule: props.storeModule,
  getterName: props.getterName,
  actionName: props.actionName,
  editRouteName: props.editRouteName,
  columns: props.columns,
});
</script>

<style lang="scss" scoped>
.admin-table-wrapper {
  width: 100%;
}
</style>
