<template>
  <q-page class="flex flex-center">
    <pre>{{ test }}</pre>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

//
const $store = useStore();
const test = computed(()=>$store.getters.init)
</script>
