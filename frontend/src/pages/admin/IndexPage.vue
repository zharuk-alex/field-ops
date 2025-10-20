<template>
  <q-page class="flex flex-center">
    <h1>Admin</h1>
    <pre>{{ testEnv }}</pre>
    <q-btn color="primary" icon="check" label="OK" @click="test" />
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { computed } from 'vue'

const test = async () => {
  console.log('click')
  const result = await api.get('/health/live')
  console.log('health', result)
}

const testEnv = computed(() => import.meta.env.VITE_BUILD_TARGET)
</script>
