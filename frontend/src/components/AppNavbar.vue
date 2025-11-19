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
        <q-badge v-if="isAdminBuild" color="red" class="q-ml-sm">Admin</q-badge>
      </q-toolbar-title>

      <q-icon
        v-if="isPwaMode && !isOnline"
        name="cloud_off"
        color="orange"
        size="sm"
        class="q-mr-sm"
      >
        <q-tooltip>{{ t('offline') }}</q-tooltip>
      </q-icon>

      <q-btn
        v-if="showFilterButton"
        flat
        dense
        round
        icon="mdi-filter-outline"
        aria-label="Filter"
        @click="filterDrawer = true"
      />

      <q-btn
        v-if="showAuditMenu"
        flat
        dense
        round
        icon="mdi-dots-vertical"
        aria-label="Menu"
      >
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup @click="$emit('clear-audit')">
              <q-item-section avatar>
                <q-icon name="refresh" color="amber" />
              </q-item-section>
              <q-item-section>{{ t('clearAudit') }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>

  <FiltersDrawer v-model="filterDrawer" />
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import FiltersDrawer from '@/components/pwa/FiltersDrawer.vue';

const $emit = defineEmits(['click', 'clear-audit']);

const { $route, $store, isPwaMode, isAdminBuild, t } = useGlobMixin();

const filterDrawer = ref(false);

const isOnline = computed(() => $store.getters['uiServices/isOnline']);

const showFilterButton = computed(() => {
  return isPwaMode && $route?.name === 'home';
});

const showAuditMenu = computed(() => {
  return isPwaMode && $route?.name === 'audit-perform';
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
