<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    @update:model-value="updateValue"
  >
    <q-card class="bg-black">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">
          {{ t('photo') }}
          <span v-if="photos.length > 1" class="text-caption q-ml-sm">
            ({{ currentIndex + 1 }} / {{ photos.length }})
          </span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="close" />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-carousel
          v-model="currentSlide"
          animated
          swipeable
          infinite
          control-color="white"
          :arrows="photos.length > 1"
          :navigation="photos.length > 1"
          height="80vh"
          class="bg-transparent"
        >
          <q-carousel-slide
            v-for="(photo, index) in photos"
            :key="photo.id || index"
            :name="index"
            class="photo-slide"
          >
            <div class="photo-full-container">
              <img
                :src="photo.url"
                :alt="`Photo ${index + 1}`"
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
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '@/helpers/datetime';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: Object,
    default: null,
  },
  photos: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
  infoText: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const currentSlide = ref(0);

const currentIndex = computed(() => currentSlide.value);

const photos = computed(() => {
  if (props.photos.length > 0) {
    return props.photos;
  }
  if (props.photo) {
    return [props.photo];
  }
  return [];
});

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      currentSlide.value = props.initialIndex;
    }
  },
);

function updateValue(value) {
  emit('update:modelValue', value);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.photo-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-full-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.photo-full-img {
  max-width: 100%;
  max-height: 70vh;
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

:deep(.q-carousel__control) {
  color: white;
}
</style>
