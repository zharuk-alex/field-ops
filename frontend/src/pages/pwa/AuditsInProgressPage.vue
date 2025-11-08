<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ t('auditsInProgress') }}</div>

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
        </q-item-section>

        <q-item-section side>
          <div class="column items-end">
            <q-circular-progress
              :value="calculateProgress(audit)"
              size="50px"
              :thickness="0.15"
              color="primary"
              track-color="grey-3"
              class="q-mb-xs"
            >
              {{ calculateProgress(audit) }}%
            </q-circular-progress>
            <q-item-label caption>
              {{ formatDate(audit.startedAt) }}
            </q-item-label>
          </div>
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click.stop="confirmDelete(audit)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { auditsDataTable } from '@/boot/db';
import { useQuasar } from 'quasar';

const router = useRouter();
const { t } = useGlobMixin();
const $q = useQuasar();

const loading = ref(true);
const audits = ref([]);

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

function calculateProgress(auditData) {
  const total = auditData.audit.questions?.length || 0;
  if (!total) return 0;
  const answered = Object.keys(auditData.answers || {}).length;
  return Math.round((answered / total) * 100);
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
  router.push({
    name: 'audit-perform',
    params: { id: auditData.localId },
  });
}

function confirmDelete(auditData) {
  $q.dialog({
    title: t('сonfirm'),
    message: t('confirmDeleteAudit'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await deleteAudit(auditData);
  });
}

async function deleteAudit(auditData) {
  try {
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
