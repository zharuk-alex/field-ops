<template>
  <q-page padding>
    <router-view name="list" :key="$route.fullPath" />
    <router-view name="new" :key="$route.fullPath" />
    <router-view name="edit" :key="$route.fullPath" />
  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router';
const $route = useRoute();
</script>

<style scoped></style>
