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
        <q-btn flat :to="{ path: '/' }" class="logo-btn">
          <img src="/icons/icon-128x128.png" alt="Field Ops" class="logo-img" />
        </q-btn>
      </q-toolbar-title>

      <q-btn
        v-if="showFilterButton"
        flat
        dense
        round
        icon="mdi-filter-outline"
        aria-label="Filter"
        @click="filterDrawer = true"
      />
    </q-toolbar>
  </q-header>

  <FiltersDrawer v-model="filterDrawer" />
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import FiltersDrawer from '@/components/pwa/FiltersDrawer.vue';

const $emit = defineEmits(['click']);

const { $route, isPwaMode } = useGlobMixin();

const filterDrawer = ref(false);

const showFilterButton = computed(() => {
  return isPwaMode && $route?.name === 'home';
});
</script>

<style lang="scss" scoped>
.logo-btn {
  padding: 4px;
}

.logo-img {
  height: 40px;
  width: 40px;
  display: block;
}
</style>
