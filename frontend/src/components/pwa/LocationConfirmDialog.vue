<template>
  <q-dialog :model-value="modelValue" persistent>
    <q-card style="max-width: 400px; width: 90dvw">
      <q-card-section class="text-center">
        <div class="text-h6">{{ title }}</div>
        <div v-if="locationName" class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ locationName }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center">
        <q-item>
          <q-item-section top avatar>
            <q-avatar
              :icon="statusIcon"
              :color="statusColor"
              text-color="white"
              size="lg"
              :class="{ 'pulse-animate': isLoading }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body2">
              {{ statusMessage }}
            </q-item-label>
            <q-item-label
              v-if="distanceText"
              caption
              class="q-mt-sm text-primary"
            >
              {{ distanceText }}
            </q-item-label>
            <div v-if="showRetry" class="q-mt-md">
              <q-btn
                color="primary"
                :label="t('retry')"
                @click="handleRetry"
                size="sm"
                outline
                :loading="isLoading"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between">
        <q-btn
          flat
          :label="t('cancel')"
          color="grey-8"
          class="col"
          @click="handleCancel"
        />
        <q-separator vertical />
        <q-btn
          flat
          :label="confirmLabel || t('confirm')"
          color="primary"
          class="col"
          @click="handleConfirm"
          :disable="!canConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useGeoposition } from '@/composable/useGeoposition';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    default: '',
  },
  targetLocation: {
    type: Object,
    default: null,
  },
  confirmLabel: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const { t } = useGlobMixin();
const {
  coords,
  error,
  isLoading,
  getPosition,
  calculateDistance,
  formatDistance,
} = useGeoposition();

const statusIcon = computed(() => {
  if (error.value) {
    return 'mdi-crosshairs-off';
  }
  if (coords.value.latitude && coords.value.longitude) {
    return 'mdi-crosshairs-gps';
  }
  return 'mdi-crosshairs-question';
});

const statusColor = computed(() => {
  if (error.value) return 'negative';
  if (coords.value.latitude && coords.value.longitude) return 'positive';
  return 'grey';
});

const statusMessage = computed(() => {
  if (error.value) {
    return error.value.message;
  }
  if (isLoading.value) {
    return t('gps.gettingLocation');
  }
  if (coords.value.latitude && coords.value.longitude) {
    return t('gps.currentLocation');
  }
  return t('gps.gettingLocation');
});

const distance = computed(() => {
  if (!coords.value.latitude || !coords.value.longitude) return null;
  if (!props.targetLocation?.latitude || !props.targetLocation?.longitude)
    return null;

  return calculateDistance(
    { latitude: coords.value.latitude, longitude: coords.value.longitude },
    {
      latitude: props.targetLocation.latitude,
      longitude: props.targetLocation.longitude,
    },
  );
});

const distanceText = computed(() => {
  if (distance.value === null) return null;
  return `${t('gps.distanceToLocation')}: ${formatDistance(distance.value)}`;
});

const showRetry = computed(() => {
  return error.value?.code && [2, 3].includes(error.value.code);
});

const canConfirm = computed(() => {
  return coords.value.latitude && coords.value.longitude && !isLoading.value;
});

function handleRetry() {
  getPosition({ maximumAge: 0, timeout: 30000 });
}

function handleCancel() {
  emit('update:modelValue', false);
  emit('cancel');
}

function handleConfirm() {
  emit('confirm', {
    latitude: coords.value.latitude,
    longitude: coords.value.longitude,
    accuracy: coords.value.accuracy,
    locatedAt: Date.now(),
  });
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      getPosition();
    }
  },
);

onMounted(() => {
  if (props.modelValue) {
    getPosition();
  }
});
</script>

<style lang="scss" scoped>
.pulse-animate {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
