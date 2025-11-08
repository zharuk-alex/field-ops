<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="$emit('click')"
      />
      <q-toolbar-title>
        <q-btn stretch flat label="Field Ops" :to="{ path: '/' }" />
      </q-toolbar-title>

      <q-btn
        v-if="showFilterButton"
        flat
        dense
        round
        icon="filter_list"
        aria-label="Filter"
        @click="filterDrawer = true"
      />
    </q-toolbar>
  </q-header>

  <q-drawer v-model="filterDrawer" side="right" overlay elevated :width="280">
    <q-list padding>
      <q-item-label header>{{ t('filters') }}</q-item-label>

      <q-item>
        <q-item-section>
          <q-select
            v-model="groupBy"
            :options="groupByOptions"
            :label="t('groupBy')"
            emit-value
            map-options
            filled
            @update:model-value="onGroupByChange"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const $emit = defineEmits(['click']);

const { $store, t, $route } = useGlobMixin();

const filterDrawer = ref(false);

const showFilterButton = computed(() => {
  return $route?.name === 'index';
});

const groupBy = computed({
  get: () => $store.getters['pwaFilters/groupBy'],
  set: value => $store.dispatch('pwaFilters/setGroupBy', value),
});

const groupByOptions = computed(() => [
  { label: t('groupByLocation'), value: 'location' },
  { label: t('groupByTemplate'), value: 'template' },
]);

function onGroupByChange(value) {
  $store.dispatch('pwaFilters/setGroupBy', value);
}
</script>

<style lang="scss" scoped></style>
