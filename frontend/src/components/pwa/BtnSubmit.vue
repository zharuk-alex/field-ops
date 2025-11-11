<template>
  <q-btn
    flat
    square
    class="fit col"
    :icon="sendBtnIcon"
    :disable="disableSubmit"
    :color="`grey-${$q.dark.isActive ? 3 : 8}`"
  >
    <template #loading>
      <q-spinner-facebook />
    </template>
  </q-btn>
</template>

<script setup>
import { computed } from 'vue';
// const $attrs = useAttrs()

const $props = defineProps({
  disableSubmit: {
    type: Boolean,
  },
  loading: {
    type: Boolean,
  },
});

const sendBtnIcon = computed(() =>
  $props.disableSubmit ? 'mdi-send-lock-outline' : 'mdi-send-outline',
);
</script>

<style lang="scss" scoped></style>
