<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    @update:model-value="updateValue"
  >
    <q-card class="bg-black">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ t('photo') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="close" />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="photo-full-container">
          <img
            v-if="photo"
            :src="photo.url"
            :alt="'Photo'"
            class="photo-full-img"
          />
          <div v-if="infoText" class="photo-info">
            <q-chip dense color="primary" text-color="white">
              {{ infoText }}
            </q-chip>
          </div>
        </div>

        <div v-if="photo" class="text-white q-mt-md">
          <div class="text-caption">
            {{ t('createdAt') }}: {{ formatDateTime(photo.createdAt) }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '@/helpers/datetime';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: Object,
    default: null,
  },
  infoText: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

function updateValue(value) {
  emit('update:modelValue', value);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.photo-full-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  position: relative;
}

.photo-full-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.photo-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: center;
}
</style>
