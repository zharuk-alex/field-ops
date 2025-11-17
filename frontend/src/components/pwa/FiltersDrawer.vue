<template>
  <q-drawer v-if="isPwaMode" :model-value="modelValue" @update:model-value="updateValue" side="right" overlay elevated :width="280">
    <q-list padding>
      <q-item-label header class="flex align-center">
        <span>{{ t('filters') }}</span>
        <q-space />
        <q-btn round flat icon="mdi-close" @click="close" />
      </q-item-label>

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
import { computed } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const { $store, t, isPwaMode } = useGlobMixin();

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

function updateValue(value) {
  emit('update:modelValue', value);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped></style>
