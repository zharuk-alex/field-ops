<template>
  <q-page padding>
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="50px" color="primary" />
    </div>

    <div v-else-if="!audits.length" class="text-center q-pa-xl text-grey-6">
      {{ t('noAuditsInProgress') }}
    </div>

    <q-list v-else separator>
      <q-item
        v-for="audit in audits"
        :key="audit.localId"
        clickable
        @click="continueAudit(audit)"
        class="q-mb-sm"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ audit.audit.name }}
          </q-item-label>
          <q-item-label v-if="audit.audit.description" caption>
            {{ audit.audit.description }}
          </q-item-label>
          <q-item-label v-if="audit.audit.location" caption class="q-mt-xs">
            <q-icon name="place" size="xs" />
            {{ audit.audit.location.name }}
          </q-item-label>
          <q-item-label caption>
            {{ formatDate(audit.startedAt) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side class="row q-gutter-md">
          <q-btn
            v-if="audit.isValid && !!audit.endLocation"
            flat
            dense
            round
            icon="send"
            color="positive"
            :loading="submittingAuditId === audit.localId"
            :disable="!isOnline || submittingAuditId === audit.localId"
            @click.stop="submitAudit(audit)"
          />
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click.stop="confirmDelete(audit)"
            :disable="submittingAuditId === audit.localId"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { auditsDataTable, photosTable } from '@/boot/db';

const { $store, t, $router, $q } = useGlobMixin();

const loading = ref(true);
const audits = ref([]);
const submittingAuditId = ref(null);

const isOnline = computed(() => $store.getters['uiServices/isOnline']);

async function loadAudits() {
  try {
    loading.value = true;
    const data = await auditsDataTable.toArray();
    audits.value = data.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  } catch (err) {
    console.error('Load audits error', err);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function continueAudit(auditData) {
  $router.push({
    name: 'audit-perform',
    params: { id: auditData.localId },
  });
}

async function submitAudit(auditData) {
  if (!isOnline.value) {
    $q.notify({
      message: t('offline'),
      color: 'warning',
    });
    return;
  }

  try {
    submittingAuditId.value = auditData.localId;

    await $store.dispatch('pwaAudits/loadAuditByLocalId', auditData.localId);
    await $store.dispatch('pwaAudits/submitAudit');

    audits.value = audits.value.filter(a => a.localId !== auditData.localId);

    $q.notify({
      message: t('auditSubmittedSuccessfully'),
      color: 'positive',
    });
  } catch (err) {
    console.error('Submit audit error', err);
    $q.notify({
      message: t('failedToSubmitAudit'),
      color: 'negative',
    });
  } finally {
    submittingAuditId.value = null;
  }
}

function confirmDelete(auditData) {
  $q.dialog({
    title: t('confirm'),
    message: t('confirmDeleteAudit'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await deleteAudit(auditData);
  });
}

async function deleteAudit(auditData) {
  try {
    await photosTable.where('auditLocalId').equals(auditData.localId).delete();
    await auditsDataTable.delete(auditData.localId);
    audits.value = audits.value.filter(a => a.localId !== auditData.localId);
    $q.notify({
      message: t('auditDeleted'),
      color: 'positive',
    });
  } catch (err) {
    console.error('Delete audit error', err);
    $q.notify({
      message: t('failed'),
      color: 'negative',
    });
  }
}

onMounted(() => {
  loadAudits();
});
</script>

<style lang="scss" scoped></style>
