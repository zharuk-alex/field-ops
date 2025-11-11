<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="bottom"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bottom-sheet-card" :class="{ 'is-swiping': swiping }">
      <div
        class="swipe-handle"
        v-touch-pan.vertical.mouse="handlePan"
        @click="close"
      >
        <div class="swipe-indicator"></div>
      </div>

      <q-card-section v-if="$slots.header" class="q-pa-sm">
        <slot name="header"></slot>
      </q-card-section>

      <q-separator v-if="$slots.header" />

      <q-card-section class="q-pa-sm scroll full-height">
        <slot></slot>
      </q-card-section>

      <q-separator v-if="$slots.footer" />

      <q-card-section v-if="$slots.footer" class="q-pa-none">
        <slot name="footer"></slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const swiping = ref(false);

const close = () => {
  emit('update:modelValue', false);
};

const handlePan = details => {
  if (details.direction === 'up') return;

  if (details.isFirst) {
    swiping.value = true;
  }

  if (details.isFinal) {
    swiping.value = false;
    if (details.offset.y > 100) {
      close();
    }
  }
};
</script>

<style lang="scss" scoped>
.bottom-sheet-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  height: calc(100vh - 50px);
  max-height: calc(100vh - 50px);
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;

  &.is-swiping {
    transition: none;
  }
}

.swipe-handle {
  padding: 12px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.swipe-indicator {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.3);
}

body.body--dark .swipe-indicator {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
