<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{
          isNew
            ? t('create') + ' ' + t('company')
            : t('edit') + ' ' + t('company')
        }}
      </div>
    </q-card-section>

    <q-form @submit.prevent="onSubmit" greedy class="q-gutter-md">
      <q-card-section>
        <q-input
          dense
          filled
          v-model="form.name"
          :label="t('name')"
          :rules="[val => !!val || t('form.requiredField')]"
        />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.timezone"
              :label="t('timezone')"
              hint="e.g. Europe/Copenhagen"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.locale"
              :label="t('locale')"
              hint="e.g. en, uk, da"
            />
          </div>
        </div>

        <q-input
          dense
          filled
          v-model="metaText"
          type="textarea"
          :label="t('meta')"
          hint="JSON object (optional)"
        />

        <div class="row q-col-gutter-md q-mt-md items-center">
          <div class="col-12 col-md-6">
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

          <div class="col-12 col-md-6 text-right">
            <q-btn flat :label="t('cancel')" @click="onCancel" />
            <q-btn
              class="q-ml-sm"
              :label="t('save')"
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useGlobMixin } from 'src/composable/useGlobalMixin';

const { $store, t, $router, $route } = useGlobMixin();

const id = computed(() => $route.params.id || null);
const isNew = computed(() => !id.value);

const saving = ref(false);
const metaText = ref('');

const STATUS = ['active', 'inactive'];
const statusOptions = STATUS.map(v => ({ label: t(v), value: v }));

const form = reactive({
  name: '',
  timezone: '',
  locale: '',
  meta: null,
  status: 'active',
});

function resetForm() {
  form.name = '';
  form.timezone = '';
  form.locale = '';
  form.meta = null;
  metaText.value = '';
  form.status = 'active';
}

async function load() {
  if (!id.value) {
    resetForm();
    return;
  }
  try {
    const res = await $store.dispatch('adminCompanies/getCompany', id.value);
    const data = res?.data || res || {};
    form.name = data.name || '';
    form.timezone = data.timezone || '';
    form.locale = data.locale || '';
    form.status = data.status || 'active';
    form.meta = data.meta ?? null;
    metaText.value = form.meta ? JSON.stringify(form.meta, null, 2) : '';
    console.log(res);
  } catch (err) {
    console.error('Load company failed', err);
  }
}

function parseMeta() {
  if (!metaText.value || !metaText.value.trim()) {
    form.meta = null;
    return true;
  }
  try {
    form.meta = JSON.parse(metaText.value);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function onSubmit() {
  if (!form.name || !form.name.trim()) return;

  if (!parseMeta()) {
    $store
      .dispatch('uiServices/showNotification', {
        message: t('form.formFilledIncorrect') + ' (meta JSON)',
        color: 'negative',
      })
      .catch(() => {});
    return;
  }

  const payload = {
    name: form.name.trim(),
    timezone: form.timezone || null,
    locale: form.locale || null,
    meta: form.meta,
    status: form.status,
  };

  saving.value = true;
  try {
    if (isNew.value) {
      const res = await $store.dispatch('adminCompanies/createCompany', {
        form: payload,
      });
      const created = res?.data ?? res ?? null;
      if (created?.id) {
        $router.push({ name: 'companies-list' });
      } else {
        throw new Error('Company not created');
      }
    } else {
      await $store.dispatch('adminCompanies/updateCompany', {
        id: id.value,
        form: payload,
      });
      $router.push({ name: 'companies-list' });
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

watch(id, load);
onMounted(load);
</script>

<style scoped>
.q-card-section textarea {
  min-height: 120px;
}
</style>
