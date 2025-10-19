<template>
  <q-page class="flex flex-center">
    <q-btn color="primary" icon="check" label="OK" @click="test" />
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'

// import { computed } from 'vue';
// import { useStore } from 'vuex';

// //
// const $store = useStore();
const test = async () => {
  console.log('click')
  const result = await api.get('/health/live')
  console.log('health', result)
}
</script>
