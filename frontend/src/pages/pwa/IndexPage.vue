<template>
  <q-page class="flex flex-center">
    <div>
      <h1>PWA Test</h1>
      <pre>{{ testEnv }}</pre>
      <q-btn color="primary" icon="check" label="OK" @click="test" />
    </div>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { computed } from 'vue'

const test = async () => {
  console.log('click')
  const result = await api.get('/api/health/live')
  console.log('health', result)
}

const testEnv = computed(() => import.meta.env.VITE_BUILD_TARGET)
</script>
