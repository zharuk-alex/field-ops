<template>
  <q-layout view="lHh Lpr lFf">
    <AppNavbar @click="toggleLeftDrawer" />
    <AppDrawer v-model:drawer="isAppDrawer" />

    <q-page-container>
      <AppBreadcrumbs />
      <router-view />
    </q-page-container>

    <AppFooter />
  </q-layout>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue';
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue';
import AppDrawer from '@/components/AppDrawer.vue';
import AppFooter from '@/components/AppFooter.vue';
import { ref } from 'vue';

const isAppDrawer = ref(false);

function toggleLeftDrawer() {
  isAppDrawer.value = !isAppDrawer.value;
}
</script>
