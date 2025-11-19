<template>
  <q-page padding>
    <div class="text-h4 q-mb-lg">{{ t('dashboard') }}</div>

    <div class="row q-col-gutter-md">
      <div
        class="col-12 col-sm-6 col-md-3"
        v-for="card in cardsData"
        :key="card.key"
      >
        <q-card>
          <q-card-section>
            <div class="text-overline text-grey-7">{{ card.title }}</div>
            <div class="text-h3 q-mt-sm" :class="[`text-${card.color}`]">
              {{ card.stat }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ card.subtitle }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const { $store, t } = useGlobMixin();

const stats = computed(() => $store.getters['adminDashboard/stats']);

const cardsData = computed(() => [
  {
    key: 'audits',
    title: t('audits'),
    stat: stats.value.auditsCount,
    subtitle: t('totalAudits'),
    color: 'primary',
  },
  {
    key: 'users',
    title: t('users'),
    stat: stats.value.usersCount,
    subtitle: t('activeUsers'),
    color: 'green',
  },
  {
    key: 'templates',
    title: t('templates'),
    stat: stats.value.templatesCount,
    subtitle: t('activeTemplates'),
    color: 'orange',
  },
  {
    key: 'locations',
    title: t('locations'),
    stat: stats.value.locationsCount,
    subtitle: t('totalLocations'),
    color: 'purple',
  },
]);

onMounted(async () => {
  await $store.dispatch('adminDashboard/fetchStats');
});
</script>
