<template>
  <AdminTable
    title="Audits"
    store-module="adminAudits"
    getter-name="audits"
    action-name="getAudits"
    edit-route-name="audit-view"
    create-route-name="audit-create"
    :columns="columns"
    :custom-body-cell-slots="['status']"
  >
    <template #body-cell-status="{ props }">
      <q-td :props="props">
        <q-badge :color="getStatusColor(props.row.status)">
          {{ t(props.row.status) }}
        </q-badge>
      </q-td>
    </template>
  </AdminTable>
</template>

<script setup>
import { useGlobMixin } from '@/composable/useGlobalMixin';
import AdminTable from '@/components/admin/AdminTable.vue';

const { t } = useGlobMixin();

const columns = [
  {
    name: 'company',
    field: row => row.company?.name,
    label: t('company'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'template',
    field: row => row.template?.name,
    label: t('template'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'location',
    field: row => row.location?.name,
    label: t('location'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'assignee',
    field: row => row.assignee?.fullName || row.assignee?.email,
    label: t('assignee'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    field: 'status',
    label: t('status'),
    align: 'center',
    sortable: true,
  },
  {
    name: 'startsAt',
    field: row =>
      row.startsAt ? new Date(row.startsAt).toLocaleDateString() : '-',
    label: t('startDate'),
    align: 'left',
    sortable: true,
  },
];

function getStatusColor(status) {
  const colors = {
    draft: 'grey',
    open: 'blue',
    in_progress: 'orange',
    submitted: 'purple',
    reviewed: 'teal',
    closed: 'green',
  };
  return colors[status] || 'grey';
}
</script>
