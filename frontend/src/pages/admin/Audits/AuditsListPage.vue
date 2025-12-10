<template>
  <q-page padding>
    <AdminTable
      :title="t('audits')"
      store-module="adminAudits"
      getter-name="audits"
      action-name="getAudits"
      edit-route-name="admin:audit:view"
      :columns="columns"
      :custom-body-cell-slots="['status', 'companyName', 'locationName', 'assigneeName']"
      :initial-sort="{ sortBy: 'endsAt', descending: true }"
    >
      <template #body-cell-status="{ props }">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ t(`auditStatus.${props.row.status}`) }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-companyName="{ props }">
        <q-td :props="props">
          {{ props.row.company?.name || '-' }}
        </q-td>
      </template>

      <template #body-cell-locationName="{ props }">
        <q-td :props="props">
          {{ props.row.location?.name || '-' }}
        </q-td>
      </template>

      <template #body-cell-assigneeName="{ props }">
        <q-td :props="props">
          <div v-if="props.row.assignee">
            {{ props.row.assignee.firstName }} {{ props.row.assignee.lastName }}
            <div class="text-caption text-grey-6">
              {{ props.row.assignee.email }}
            </div>
          </div>
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>
    </AdminTable>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AdminTable from '@/components/admin/AdminTable.vue';
import { formatDateTime } from '@/helpers/datetime';

const { t } = useI18n();

const columns = computed(() => [
  // {
  //   name: 'id',
  //   label: 'ID',
  //   field: 'id',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'status',
    label: t('status'),
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'templateName',
    label: t('template'),
    field: row => row.template?.name || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'companyName',
    label: t('company'),
    field: row => row.company?.name || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'locationName',
    label: t('location'),
    field: row => row.location?.name || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'assigneeName',
    label: t('assignee'),
    field: row =>
      row.assignee ? `${row.assignee.firstName} ${row.assignee.lastName}` : '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'startsAt',
    label: t('startedAt'),
    field: row => (row.startsAt ? formatDateTime(row.startsAt) : '-'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'endsAt',
    label: t('completedAt'),
    field: row => (row.endsAt ? formatDateTime(row.endsAt) : '-'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: t('createdAt'),
    field: row => formatDateTime(row.createdAt),
    align: 'left',
    sortable: true,
  },
]);

function getStatusColor(status) {
  const colors = {
    draft: 'grey',
    pending: 'orange',
    'in-progress': 'blue',
    submitted: 'green',
    completed: 'positive',
    cancelled: 'negative',
  };
  return colors[status] || 'grey';
}
</script>

<style lang="scss" scoped></style>
