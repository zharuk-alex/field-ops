<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{
          isNew
            ? t('create') + ' ' + t('location')
            : t('edit') + ' ' + t('location')
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

        <q-input
          dense
          filled
          v-model="form.address"
          :label="t('address')"
          class="q-mb-md"
        />

        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <q-input
              dense
              filled
              v-model.number="form.lat"
              type="number"
              :label="t('lat')"
              :rules="[
                val =>
                  val === '' ||
                  val === null ||
                  !isNaN(val) ||
                  t('form.notNegativeVal'),
              ]"
            />
          </div>

          <div class="col-6 col-md-3">
            <q-input
              dense
              filled
              v-model.number="form.lng"
              type="number"
              :label="t('lng')"
              :rules="[
                val =>
                  val === '' ||
                  val === null ||
                  !isNaN(val) ||
                  t('form.notNegativeVal'),
              ]"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              dense
              filled
              v-model="form.companyId"
              :options="companyOptions"
              :label="t('company')"
              emit-value
              map-options
              clearable
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
            <q-btn flat label="Cancel" @click="onCancel" />
            <q-btn
              class="q-ml-sm"
              label="Save"
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

const companies = computed(
  () => $store.getters['adminCompanies/companies'] ?? [],
);
const companyOptions = computed(() =>
  Array.isArray(companies.value) && companies.value.length
    ? companies.value.map(c => ({ label: c.name, value: c.id }))
    : [],
);

const form = reactive({
  name: '',
  address: '',
  lat: null,
  lng: null,
  meta: null,
  status: 'active',
  companyId: $store.getters['auth/companyId'] ?? null,
});

function resetForm() {
  form.name = '';
  form.address = '';
  form.lat = null;
  form.lng = null;
  form.meta = null;
  metaText.value = '';
  form.status = 'active';
  form.companyId = $store.getters['auth/companyId'] ?? null;
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

async function load() {
  if (!id.value) {
    resetForm();
    return;
  }
  try {
    const res = await $store.dispatch('adminLocations/getLocation', id.value);
    const data = res.data || {};
    form.name = data.name || '';
    form.address = data.address || '';
    form.lat = data.lat ?? null;
    form.lng = data.lng ?? null;
    form.status = data.status || 'active';
    form.companyId = data.companyId || form.companyId;
    form.meta = data.meta ?? null;
    metaText.value = form.meta ? JSON.stringify(form.meta, null, 2) : '';
  } catch (err) {
    console.error('Load location failed', err);
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
  if (!parseMeta()) {
    console.warn('Meta is not valid JSON');
    $store
      .dispatch('uiServices/showNotification', {
        message: t('form.formFilledIncorrect') + ' (meta JSON)',
        color: 'negative',
      })
      .catch(() => {});
    return;
  }

  const payload = {
    name: form.name,
    address: form.address || null,
    lat: form.lat === '' ? null : form.lat,
    lng: form.lng === '' ? null : form.lng,
    meta: form.meta,
    status: form.status,
    companyId: form.companyId || null,
  };

  saving.value = true;
  try {
    if (isNew.value) {
      const res = await $store.dispatch('adminLocations/createLocation', {
        form: payload,
      });
      const created = res?.data ?? null;
      if (created?.id) {
        $router.push({ name: 'locations-list' });
      } else {
        throw new Error('Location not created');
      }
    } else {
      await $store.dispatch('adminLocations/updateLocation', {
        id: id.value,
        form: payload,
      });
      $router.push({ name: 'locations-list' });
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
onMounted(() => {
  loadCompanies();
  load();
});
</script>

<style scoped>
.q-card-section textarea {
  min-height: 120px;
}
</style>
