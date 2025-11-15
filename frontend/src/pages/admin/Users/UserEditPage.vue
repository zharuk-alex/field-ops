<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{
          isNew ? t('create') + ' ' + t('user') : t('edit') + ' ' + t('user')
        }}
      </div>
    </q-card-section>

    <q-form @submit.prevent="onSubmit" greedy class="q-gutter-md">
      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.firstName"
              :label="t('firstName')"
              :rules="[val => !!val || t('form.requiredField')]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.lastName"
              :label="t('lastName')"
              :rules="[val => !!val || t('form.requiredField')]"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="form.email"
              type="email"
              :label="t('email')"
              :rules="[
                val => !!val || t('form.requiredField'),
                val => /.+@.+\..+/.test(val) || t('form.emailRule'),
              ]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-if="isNew"
              dense
              filled
              v-model="form.password"
              type="password"
              :label="t('password')"
              :rules="[
                val => !!val || t('form.requiredField'),
                val => val.length >= 6 || t('form.minCharsHint', { len: 6 }),
              ]"
            />

            <q-input
              v-else
              dense
              filled
              v-model="form.password"
              type="password"
              :label="t('password') + ' (' + t('optional') + ')'"
              :hint="t('leaveEmptyToKeepCurrent')"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              dense
              filled
              v-model="form.role"
              :options="roleOptions"
              :label="t('role')"
              emit-value
              map-options
              :rules="[val => !!val || t('form.requiredField')]"
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
              :hint="t('requiredForNonAdminRoles')"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              dense
              filled
              v-model="metaText"
              type="textarea"
              :label="t('meta')"
              hint="JSON object (optional)"
            />
          </div>

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
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-space />
        <q-btn flat :label="t('cancel')" @click="onCancel" />
        <q-btn
          class="q-ml-sm"
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

const { $store, t, $router, $route } = useGlobMixin();

const id = computed(() => $route.params.id || null);
const isNew = computed(() => !id.value);

const saving = ref(false);
const metaText = ref('');

const ROLES = ['admin', 'manager', 'user'];
const roleOptions = ROLES.map(v => ({ label: t(v), value: v }));

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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
  companyId: null,
  meta: null,
  status: 'active',
});

function resetForm() {
  form.firstName = '';
  form.lastName = '';
  form.email = '';
  form.password = '';
  form.role = 'user';
  form.companyId = null;
  form.meta = null;
  metaText.value = '';
  form.status = 'active';
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
    const res = await $store.dispatch('adminUsers/getUser', id.value);
    const data = res.data || {};
    form.firstName = data.firstName || '';
    form.lastName = data.lastName || '';
    form.email = data.email || '';
    form.password = '';
    form.role = data.role || 'user';
    form.companyId = data.companyId || null;
    form.status = data.status || 'active';
    form.meta = data.meta ?? null;
    metaText.value = form.meta ? JSON.stringify(form.meta, null, 2) : '';
  } catch (err) {
    console.error('Load user failed', err);
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
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    role: form.role,
    companyId: form.companyId || null,
    meta: form.meta,
    status: form.status,
  };

  // Only include password if it's set
  if (isNew.value || form.password) {
    payload.password = form.password;
  }

  saving.value = true;
  try {
    if (isNew.value) {
      const res = await $store.dispatch('adminUsers/createUser', {
        form: payload,
      });
      const created = res?.data ?? null;
      if (created?.id) {
        $router.push({ name: 'users-list' });
      } else {
        throw new Error('User not created');
      }
    } else {
      await $store.dispatch('adminUsers/updateUser', {
        id: id.value,
        form: payload,
      });
      $router.push({ name: 'users-list' });
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
