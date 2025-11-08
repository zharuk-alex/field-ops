<template>
  <q-breadcrumbs class="text-caption">
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

const { t } = useI18n();
const { crumbs } = useBreadcrumbs(t);
</script>
