<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-btn stretch flat label="Field Ops" :to="{ name: 'index' }" />

        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <AppDrawer v-model:drawer="isAppDrawer" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AppDrawer from 'src/components/AppDrawer.vue';
import { ref } from 'vue'

const isAppDrawer = ref(false)

function toggleLeftDrawer() {
  isAppDrawer.value = !isAppDrawer.value
}
</script>
