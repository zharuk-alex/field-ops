<template>
  <q-footer
    id="app-footer-container"
    elevated
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <q-toolbar class="q-pa-none">
      <div id="app-footer" class="full-width"></div>
    </q-toolbar>
  </q-footer>
</template>

<script setup>
import { useQuasar } from 'quasar';

const $q = useQuasar();
</script>

<style lang="scss" scoped>
#app-footer-container {
  display: none;
}

#app-footer-container:has(#app-footer > *) {
  display: block;
}
</style>
