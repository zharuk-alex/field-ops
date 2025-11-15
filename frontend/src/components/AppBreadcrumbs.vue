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
import { useI18n } from 'vue-i18n';
import { useBreadcrumbs } from '@/composable/useBreadcrumbs';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const { t } = useI18n();
const route = useRoute();
const { crumbs } = useBreadcrumbs(t);
const isHomePage = computed(() => route.name === 'home');
</script>
