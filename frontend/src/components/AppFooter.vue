<template>
  <q-footer id="app-footer-container" elevated class="bg-white text-dark">
    <q-toolbar class="q-pa-none">
      <div id="app-footer" class="full-width"></div>
    </q-toolbar>
  </q-footer>
</template>

<script setup></script>

<style lang="scss" scoped>
#app-footer-container {
  display: none;
}

#app-footer-container:has(#app-footer > *) {
  display: block;
}
</style>
