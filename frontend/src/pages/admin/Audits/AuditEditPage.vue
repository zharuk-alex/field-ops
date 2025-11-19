<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{ pageTitle }}
      </div>
    </q-card-section>

    <q-form @submit.prevent="onSubmit" greedy>
      <q-card-section class="q-gutter-y-md">
        <q-select
          filled
          dense
          v-model="form.companyId"
          :options="companyOptions"
          :label="t('company') + ' *'"
          emit-value
          map-options
          :rules="[val => !!val || t('form.requiredField')]"
          @update:model-value="onCompanyChange"
        />

        <q-select
          filled
          dense
          v-model="form.templateId"
          :options="templateOptions"
          :label="t('template') + ' *'"
          emit-value
          map-options
          :disable="!form.companyId"
          :rules="[val => !!val || t('form.requiredField')]"
          @update:model-value="onTemplateChange"
        >
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption>
                  {{ opt.questionsCount }}
                  {{ t('question', { n: opt.questionsCount }) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-if="questionOptions?.length"
          dense
          v-model="form.questionsIds"
          :options="questionOptions"
          :label="t('questions') + ' *'"
          filled
          multiple
          use-chips
          emit-value
          map-options
        />

        <q-select
          dense
          filled
          v-model="form.locationId"
          :options="locationOptions"
          :label="t('locations') + ' *'"
          emit-value
          map-options
          :disable="!form.templateId"
          :rules="[val => !!val || t('form.requiredField')]"
        >
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section avatar>
                <q-icon name="place" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption>{{ opt.address }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          dense
          filled
          v-model="form.assigneeId"
          :options="auditorOptions"
          :label="t('assignee')"
          emit-value
          map-options
          clearable
          :hint="t('leaveEmptyForLater')"
        />

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.startsAt"
              :label="t('startDate')"
              type="datetime-local"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.endsAt"
              :label="t('endDate')"
              type="datetime-local"
            />
          </div>
        </div>
        <q-select
          filled
          dense
          v-model="form.status"
          :options="statusOptions"
          :label="t('status')"
          emit-value
          map-options
        />

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 text-right">
            <q-btn flat :label="t('cancel')" @click="onCancel" />
            <q-btn
              class="q-ml-sm"
              :label="t('create')"
              color="primary"
              :loading="saving"
              type="submit"
              unelevated
            />
          </div>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const { $store, t, $router } = useGlobMixin();

const pageTitle = computed(() => `${t('create')} ${t('audit')}`);

const saving = ref(false);
const selectedTemplate = ref(null);

const form = reactive({
  companyId: null,
  templateId: null,
  locationId: null,
  questionsIds: null,
  assigneeId: null,
  startsAt: null,
  endsAt: null,
  status: 'draft',
});

const companies = computed(
  () => $store.getters['adminCompanies/companies'] ?? [],
);
const companyOptions = computed(() =>
  companies.value.map(c => ({ label: c.name, value: c.id })),
);

const templates = computed(
  () => $store.getters['adminTemplates/templates'] ?? [],
);
const templateOptions = computed(() => {
  const filtered = form.companyId
    ? templates.value.filter(t => t.companyId === form.companyId)
    : templates.value;

  return filtered.map(t => ({
    label: t.name,
    value: t.id,
    questionsCount: t.questionsIds?.length || 0,
  }));
});

const locations = computed(
  () => $store.getters['adminLocations/locations'] ?? [],
);

const locationOptions = computed(() => {
  if (!selectedTemplate.value?.locationIds?.length) {
    return locations.value
      .filter(l => l.companyId === form.companyId)
      .map(l => ({
        label: l.name,
        value: l.id,
        address: l.address,
      }));
  }

  return locations.value
    .filter(l => selectedTemplate.value.locationIds.includes(l.id))
    .map(l => ({
      label: l.name,
      value: l.id,
      address: l.address,
    }));
});

const questionOptions = computed(() => {
  return (
    selectedTemplate.value?.questions?.map((q, idx) => ({
      label: `${idx + 1}. ${q.questionText}`,
      value: q.id,
    })) ?? []
  );
});

const users = computed(() => $store.getters['adminUsers/users'] ?? []);
const auditorOptions = computed(() =>
  users.value
    .filter(u => u.role === 'auditor' && u.companyId === form.companyId)
    .map(u => ({
      label: u.fullName || u.email,
      value: u.id,
    })),
);

const statusOptions = [
  { label: t('draft'), value: 'draft' },
  { label: t('open'), value: 'open' },
];

async function onCompanyChange() {
  form.templateId = null;
  form.locationId = null;
  form.assigneeId = null;
  form.questionsIds = null;
  selectedTemplate.value = null;

  if (form.companyId) {
    await $store.dispatch('adminTemplates/getTemplates', {
      page: 1,
      limit: 100,
    });
  }
}

async function onTemplateChange() {
  form.locationId = null;
  form.questionsIds = null;

  if (form.templateId) {
    try {
      const res = await $store.dispatch(
        'adminTemplates/getTemplate',
        form.templateId,
      );
      selectedTemplate.value = res.data;
      form.questionsIds =
        selectedTemplate.value?.questions?.map(q => q.id) ?? [];
    } catch (err) {
      console.error('Load template failed', err);
    }
  } else {
    selectedTemplate.value = null;
  }
}

async function loadInitialData() {
  await Promise.all([
    $store.dispatch('adminCompanies/getCompanies', { page: 1, limit: 100 }),
    $store.dispatch('adminLocations/getLocations', { page: 1, limit: 100 }),
    $store.dispatch('adminUsers/getUsers', { page: 1, limit: 100 }),
  ]);
}

async function onSubmit() {
  saving.value = true;
  try {
    const payload = {
      companyId: form.companyId,
      templateId: form.templateId,
      locationId: form.locationId || null,
      assigneeId: form.assigneeId || null,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      status: form.status,
    };

    await $store.dispatch('adminAudits/createAudit', { form: payload });

    $store.dispatch('uiServices/showNotification', {
      message: t('auditCreatedSuccessfully'),
      color: 'positive',
    });

    $router.push({ name: 'audits-list' });
  } catch (err) {
    console.error('Create audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: err?.response?.data?.message || t('failed'),
      color: 'negative',
    });
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  $router.back();
}

onMounted(loadInitialData);
</script>

<style lang="scss" scoped></style>
