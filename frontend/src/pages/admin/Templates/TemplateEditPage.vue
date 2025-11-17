<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{
          isNew
            ? t('create') + ' ' + t('template')
            : t('edit') + ' ' + t('template')
        }}
      </div>
    </q-card-section>

    <q-form ref="formRef" @submit.prevent="onSubmit" greedy class="q-gutter-md">
      <q-card-section>
        <q-input
          dense
          filled
          v-model="form.name"
          :label="t('name')"
          :rules="[val => !!(val && val.trim()) || t('form.requiredField')]"
        />

        <q-input
          dense
          filled
          v-model="form.description"
          :label="t('description')"
          type="textarea"
          autogrow
        />

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-4">
            <q-select
              dense
              filled
              v-model="form.status"
              :options="statusOptions"
              :label="t('status')"
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-8">
            <q-select
              dense
              filled
              v-model="form.companyId"
              :options="companyOptions"
              :label="t('company')"
              emit-value
              map-options
              clearable
              @update:model-value="onCompanyChange"
            />
          </div>
        </div>

        <div class="q-mt-md">
          <q-toggle
            v-model="form.restrictPhotoAge"
            :label="t('restrictPhotoAge')"
            color="primary"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            {{ t('restrictPhotoAgeHint') }}
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-select
              dense
              filled
              v-model="form.questionIds"
              :options="questionOptions"
              :label="t('questions')"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              multiple
              use-chips
              clearable
              :loading="loadingQuestions"
              :hint="t('form.multiSelectHint')"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              dense
              filled
              v-model="form.locationIds"
              :options="locationOptions"
              :label="t('locations')"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              multiple
              use-chips
              clearable
              :loading="loadingLocations"
              :hint="t('form.multiSelectHint')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pr-md q-pb-md">
        <q-btn flat :label="t('cancel')" @click="onCancel" />
        <q-btn
          :label="t('save')"
          color="primary"
          :loading="saving"
          type="submit"
          unelevated
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useGlobMixin } from 'src/composable/useGlobalMixin';
import { api } from 'src/boot/axios';

const { $store, t, $router, $route } = useGlobMixin();

const id = computed(() => $route.params.id || null);
const isNew = computed(() => !id.value);

const formRef = ref(null);
const saving = ref(false);

const STATUS = ['active', 'inactive'];
const statusOptions = STATUS.map(v => ({ label: t(v), value: v }));

const companies = computed(
  () => $store.getters['adminCompanies/companies'] ?? [],
);
const companyOptions = computed(() =>
  Array.isArray(companies.value) && companies.value.length
    ? companies.value.map(c => ({ label: c.name, value: c.id }))
    : [],
);

const loadingQuestions = ref(false);
const loadingLocations = ref(false);

const questions = ref([]);
const locations = ref([]);

const questionOptions = computed(() =>
  questions.value.map(q => ({ label: q.questionText, value: q.id })),
);
const locationOptions = computed(() =>
  locations.value.map(l => ({ label: l.name, value: l.id })),
);

const form = reactive({
  name: '',
  description: '',
  status: 'active',
  companyId: $store.getters['auth/companyId'] ?? null,
  questionIds: [],
  locationIds: [],
  restrictPhotoAge: true,
});

function resetForm() {
  form.name = '';
  form.description = '';
  form.status = 'active';
  form.companyId = $store.getters['auth/companyId'] ?? null;
  form.questionIds = [];
  form.locationIds = [];
  form.restrictPhotoAge = true;
}

async function loadCompanies() {
  try {
    await $store.dispatch('adminCompanies/getCompanies', {
      page: 1,
      limit: 100,
    });
  } catch (err) {
    console.error('Load companies failed', err);
  }
}

async function loadQuestions(companyId) {
  loadingQuestions.value = true;
  try {
    const res = await $store
      .dispatch?.('adminQuestions/getQuestions', {
        page: 1,
        limit: 200,
        companyId,
      })
      .catch(() => null);
    if (res?.data?.items) {
      questions.value = res.data.items;
    } else {
      const r = await api.get('/api/questions', {
        params: { page: 1, limit: 200, companyId },
      });
      questions.value = r.data?.items ?? [];
    }
  } catch (e) {
    console.error('Load questions failed', e);
  } finally {
    loadingQuestions.value = false;
  }
}

async function loadLocations(companyId) {
  loadingLocations.value = true;
  try {
    const res = await $store
      .dispatch?.('adminLocations/getLocations', {
        page: 1,
        limit: 200,
        companyId,
      })
      .catch(() => null);
    if (res?.data?.items) {
      locations.value = res.data.items;
    } else {
      const r = await api.get('/api/locations', {
        params: { page: 1, limit: 200, companyId },
      });
      locations.value = r.data?.items ?? [];
    }
  } catch (e) {
    console.error('Load locations failed', e);
  } finally {
    loadingLocations.value = false;
  }
}

async function loadTemplate() {
  if (!id.value) {
    resetForm();
    await Promise.all([
      loadQuestions(form.companyId),
      loadLocations(form.companyId),
    ]);
    return;
  }
  try {
    const res = await $store
      .dispatch?.('adminTemplates/getTemplate', id.value)
      .catch(() => null);
    const data =
      res?.data ?? (await api.get(`/api/templates/${id.value}`)).data;

    form.name = data.name || '';
    form.description = data.description || '';
    form.status = data.status || 'active';
    form.companyId = data.companyId || form.companyId;
    form.questionIds = data.questionsIds ?? [];
    form.locationIds = data.locationIds ?? [];
    form.restrictPhotoAge = data.restrictPhotoAge ?? true;

    await Promise.all([
      loadQuestions(form.companyId),
      loadLocations(form.companyId),
    ]);
  } catch (err) {
    console.error('Load template failed', err);
  }
}

function onCompanyChange(val) {
  form.questionIds = [];
  form.locationIds = [];
  Promise.all([loadQuestions(val), loadLocations(val)]).catch(() => {});
}

async function onSubmit() {
  const valid = await formRef.value?.validate?.();
  if (valid === false) return;

  const payload = {
    name: (form.name || '').trim(),
    description: form.description || null,
    status: form.status,
    companyId: form.companyId || null,
    questions: form.questionIds ?? [],
    locations: form.locationIds ?? [],
    restrictPhotoAge: form.restrictPhotoAge ?? true,
  };

  saving.value = true;
  try {
    if (isNew.value) {
      const res = await $store
        .dispatch?.('adminTemplates/createTemplate', { form: payload })
        .catch(async () => await api.post('/api/templates', payload));
      const created = res?.data ?? res;
      if (created?.id) {
        $router.push({ name: 'templates-list' });
      } else {
        throw new Error('Template not created');
      }
    } else {
      await $store
        .dispatch?.('adminTemplates/updateTemplate', {
          id: id.value,
          form: payload,
        })
        .catch(
          async () => await api.put(`/api/templates/${id.value}`, payload),
        );
      $router.push({ name: 'templates-list' });
    }
  } catch (err) {
    console.error('Save error', err);
    $store
      .dispatch('uiServices/showNotification', {
        message: err?.response?.data?.message || t('failed'),
        color: 'negative',
      })
      .catch(() => {});
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  $router.back();
}

watch(id, loadTemplate);
onMounted(async () => {
  await loadCompanies();
  await loadTemplate();
});
</script>

<style scoped>
.q-card-section textarea {
  min-height: 100px;
}
</style>
