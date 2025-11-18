<template>
  <q-inner-loading showing dark>
    <q-page class="flex justify-center items-center">
      <q-card class="q-pa-lg shadow-2" style="max-width: 400px; width: 90dvw"
        :class="`bg-grey-${$q.dark.isActive ? 9 : 1}`">
        <q-card-section v-if="isAdminBuild" class="text-center q-pb-none">
          <q-badge color="red" class="text-h6 q-pa-sm">Admin</q-badge>
        </q-card-section>
        <q-card-section>
          <q-form ref="loginForm" v-model="formIsValid" @submit="onSubmit" @reset="onReset" class="q-gutter-y-lg">
            <q-input clearable v-model.trim="email" type="text" :label="$t('email')" lazy-rules :rules="[
              (val) => validateEmptyInput(val) || $t('form.emailRule'),
              (val) => validateEmail(val) || $t('form.emailRule'),
            ]" :readonly="loading" name="email" id="input_email" />
            <q-input v-model="password" :type="showPassword ? 'text' : 'password'" :label="$t('password')" lazy-rules
              :rules="[(val) => validateEmptyInput(val) || $t('form.notEmpty')]" :readonly="loading" name="password"
              id="input_password">
              <template v-slot:append>
                <q-icon :name="!showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click="showPassword = !showPassword"
                  class="cursor-pointer" />
              </template>
            </q-input>
            <div>
              <q-btn unelevated color="light-blue-7" :label="$t('login')" type="submit" :disable="submitBtnDisabled"
                class="full-width" :loading="loading" icon="mdi-login-variant" />
              <div v-if="!isOnline" class="text-body2 text-negative q-mt-sm" color="red">
                {{ $t('offline') }}
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-page>
  </q-inner-loading>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGlobMixin } from '@/composable/useGlobalMixin.js'

const { $store, $router, $q, isAdminBuild } = useGlobMixin()

const email = ref(null)
const password = ref(null)

const isOnline = computed(() => $store.getters['uiServices/isOnline'])
const loading = ref(false)
const showPassword = ref(false)
const loginForm = ref(null)
const formIsValid = ref(false)

const validateEmptyInput = (val) => val && val.length > 0
const validateEmail = (email) => {
  email = email.toString().trim().toLowerCase()
  return /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email) || /[0-9]/.test(Number(email))
}

const submitBtnDisabled = computed(() => {
  return !isOnline.value || !password.value?.length || !email.value?.length
})

const onSubmit = async () => {
  loading.value = true
  const satinazedEmail = email.value.toString().trim().toLowerCase()
  try {
    await $store.dispatch('auth/login', { email: satinazedEmail, password: password.value })
    $router.push({ path: '/' })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }

  if (window.PasswordCredential) {
    const passwordCredential = new PasswordCredential({
      id: email.value,
      password: password.value,
    })
    window.navigator.credentials.store(passwordCredential)
  }

  if ($store.getters['auth/isAuthenticated']) {
    $router.push({ path: '/' })
  } else {
    loading.value = false
  }
}

const onReset = () => {
  email.value = null
  password.value = null
}
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? ''
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''
onMounted(async () => {
  if (process.env.DEV) {
    email.value = ADMIN_USER
    password.value = ADMIN_PASSWORD
  }
})
</script>
