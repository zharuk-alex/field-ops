<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{
          isNew
            ? t('create') + ' ' + t('question')
            : t('edit') + ' ' + t('question')
        }}
      </div>
    </q-card-section>

    <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
      <q-card-section>
        <q-input
          dense
          filled
          v-model="form.questionText"
          :label="t('question')"
          :rules="[val => !!val || t('form.requiredField')]"
        />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              dense
              filled
              v-model="form.type"
              :options="typeOptions"
              :label="t('type')"
              emit-value
              map-options
              :rules="[val => !!val || t('form.requiredField')]"
            />
          </div>

          <div class="col-6 col-md-3"></div>

          <div class="col-6 col-md-3"></div>
        </div>

        <div
          v-if="form.type === 'choice' || form.type === 'multipleChoice'"
          class="q-mt-md"
        >
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input
                dense
                filled
                v-model="newChoice"
                @keyup.enter="addChoice"
                :label="t('form.addChoice')"
              />
            </div>
            <div class="col-auto">
              <q-btn dense label="Add" color="primary" @click="addChoice" />
            </div>
          </div>

          <div class="q-mt-sm">
            <q-chip
              v-for="(c, idx) in form.choices"
              :key="idx"
              removable
              @remove="removeChoice(idx)"
              class="q-mr-sm q-mb-sm"
            >
              {{ c }}
            </q-chip>

            <div v-if="!form.choices.length" class="text-caption text-grey">
              {{ t('form.noChoices') }}
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
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

          <div class="col-12 col-md-4">
            <q-select
              dense
              filled
              v-model="form.companyId"
              :options="companyOptions"
              :label="t('company')"
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-4">
            <q-checkbox v-model="form.required" :label="t('required')" dense />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pr-md q-pb-md">
        <q-btn flat label="Cancel" @click="onCancel" />
        <q-btn
          label="Save"
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
const newChoice = ref('');

const QUESTION_TYPES = [
  'text',
  'number',
  'choice',
  'multipleChoice',
  'boolean',
  'photo',
];
const STATUS = ['active', 'inactive'];

const typeOptions = QUESTION_TYPES.map(v => ({ label: t(v), value: v }));
const statusOptions = STATUS.map(v => ({ label: t(v), value: v }));

const companies = computed(() => $store.getters['adminCompanies/companies']);
const companyOptions = computed(() =>
  companies.value.map(c => ({ label: c.name, value: c.id })),
);

const form = reactive({
  questionText: '',
  type: 'text',
  choices: [],
  order: 0,
  status: 'active',
  companyId: $store.getters['auth/companyId'] ?? null,
  required: false,
});

function resetForm() {
  form.questionText = '';
  form.type = 'text';
  form.choices = [];
  form.order = 0;
  form.status = 'active';
  form.companyId = $store.getters['auth/companyId'] ?? null;
  form.required = false;
}

async function load() {
  if (!id.value) {
    resetForm();
    return;
  }
  try {
    const res = await api.get(`/api/questions/${id.value}`);
    const data = res.data;
    form.questionText = data.questionText || '';
    form.type = data.type || 'text';
    form.choices = Array.isArray(data.choices) ? data.choices.slice() : [];
    form.order = data.order ?? 0;
    form.status = data.status || 'active';
    form.companyId = data.companyId || form.companyId;
    form.required = data.required ?? false;
  } catch (err) {
    console.error('Load question failed', err);
  }
}

function addChoice() {
  const v = (newChoice.value || '').trim();
  if (!v) return;
  form.choices.push(v);
  newChoice.value = '';
}

function removeChoice(index) {
  form.choices.splice(index, 1);
}

async function onSubmit() {
  if (!form.questionText || !form.questionText.trim()) {
    formRef.value.validate && formRef.value.validate();
    return;
  }
  const payload = {
    questionText: form.questionText ?? '',
    type: form.type,
    status: form.status,
    companyId: form.companyId ?? null,
    required: form.required ?? false,
  };

  if (form.type === 'choice' || form.type === 'multipleChoice') {
    payload.choices = Array.isArray(form.choices) ? form.choices : [];
  }

  saving.value = true;

  try {
    if (isNew.value) {
      const res = await $store.dispatch('adminQuestions/createQuestion', {
        form: payload,
      });
      const created = res.data;
      if (created?.id) {
        await $router.push({ name: 'questions-list' });
      } else {
        throw new Error('Save error: question not created');
      }
    } else {
      await $store.dispatch('adminQuestions/updateQuestion', {
        id: id.value,
        form: payload,
      });
      await $router.push({ name: 'questions-list' });
    }
  } catch (err) {
    console.error('Save error', err);
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  $router.back();
}

watch(id, load);
onMounted(load);
</script>

<style scoped>
.q-card-section .q-chip {
  display: inline-flex;
}
</style>
