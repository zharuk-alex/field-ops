<template>
  <q-layout view="lHh Lpr lFf">
    <AppNavbar @click="toggleLeftDrawer" @clear-audit="handleClearAudit" />
    <AppDrawer v-model:drawer="isAppDrawer" />

    <q-page-container>
      <AppBreadcrumbs />
      <router-view :key="$route.fullPath" />
    </q-page-container>

    <AppFooter />
  </q-layout>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue';
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue';
import AppDrawer from '@/components/AppDrawer.vue';
import AppFooter from '@/components/AppFooter.vue';
import { ref, provide } from 'vue';

const isAppDrawer = ref(false);
const clearAuditTrigger = ref(0);

function toggleLeftDrawer() {
  isAppDrawer.value = !isAppDrawer.value;
}

function handleClearAudit() {
  clearAuditTrigger.value++;
}

provide('clearAuditTrigger', clearAuditTrigger);
</script>
