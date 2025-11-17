<template>
  <q-breadcrumbs v-if="!isHomePage" class="text-body1 q-ma-md">
    <q-breadcrumbs-el icon="home" :to="{ name: 'home' }" />
    <q-breadcrumbs-el
      v-for="(crumb, i) in crumbs"
      :key="i"
      :label="crumb.label"
      :to="crumb.to"
    />
  </q-breadcrumbs>
</template>

<script setup>
import { useBreadcrumbs } from '@/composable/useBreadcrumbs';
import { computed } from 'vue';
import { useGlobMixin } from 'src/composable/useGlobalMixin';

const { t, $route } = useGlobMixin();

const { crumbs } = useBreadcrumbs(t);
const isHomePage = computed(() => $route.name === 'home');
</script>
