<template>
  <q-btn
    flat
    square
    :disabled="!isPhotoInput"
    @click="() => filesInput.pickFiles()"
    :class="iconOnly ? '' : 'fit col'"
    :color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
    :size="iconOnly ? 'md' : undefined"
  >
    <q-icon :name="isPhotoInput ? 'mdi-camera-plus' : 'mdi-camera-off'" />
    <q-file
      ref="filesInput"
      class="photo-file-input"
      borderless
      @update:model-value="photoQFileChanged"
      v-bind="photoInputProps"
      :disabled="!isPhotoInput"
      :max-files="maxFilesPosible"
      @rejected="onFilesRejected"
    />
  </q-btn>
</template>

<script setup>
import { usePhotoUploadWorker } from '@/composable/usePhotoUploadWorker';
import { Notify } from 'quasar';
import { useGlobMixin } from 'src/composable/useGlobalMixin';
import { computed, ref } from 'vue';

const props = defineProps({
  auditLocalId: {
    type: String,
    required: true,
  },
  questionId: {
    type: String,
    default: null,
  },
  picMax: {
    type: Number,
    default: 50,
  },
  photosCount: {
    type: Number,
    default: 0,
  },
  uploadCameraOnly: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  restrictPhotoAge: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['photosAdded']);

const FILES_INPUT_LIMIT = 5;
const { processFiles, errors } = usePhotoUploadWorker();
const { $store, t, isAdmin, isDev } = useGlobMixin();
const filesInput = ref(null);

const isPhotoInput = computed(() => {
  return props.photosCount < props.picMax && !$store.state.loading;
});

const maxFilesPosible = computed(() => {
  return Math.min(props.picMax - props.photosCount, FILES_INPUT_LIMIT);
});

const photoInputProps = computed(() => {
  if (props.uploadCameraOnly) {
    return {
      accept: 'image/*',
      capture: 'environment',
    };
  }

  return {
    accept: 'image/*, text/plain',
    multiple: true,
  };
});

const checkPhotoDate = timestamp => {
  const millisecondsPerHour = 1000 * 60 * 60;
  const hours24 = 24 * millisecondsPerHour;
  const now = Date.now();
  const comparedTimestamp = timestamp;
  return now - comparedTimestamp <= hours24;
};

const photoQFileChanged = async files => {
  if (files instanceof File) {
    files = [files];
  } else if (Array.isArray(files)) {
    // do nothing
  } else if (files && files.length && files[0] instanceof File) {
    files = Array.from(files);
  } else {
    return;
  }

  if (files.length === 0) return;

  const validFiles = [];
  let addedCount = 0;

  for (const file of files) {
    const rawFile = file.raw ?? file;

    const extension = rawFile.name.toLowerCase().split('.').pop();
    const isValidFormat = extension === 'jpg' || extension === 'jpeg';
    const photoDateAllowed = checkPhotoDate(rawFile.lastModified);

    if (!isValidFormat) {
      Notify.create({
        color: 'negative',
        message: t('photos.formatNotAllowed', {
          filename: rawFile.name,
          format: extension,
        }),
        position: 'bottom',
        timeout: 10000,
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
      });
      continue;
    }

    if (props.restrictPhotoAge && !photoDateAllowed && !isDev && !isAdmin.value) {
      Notify.create({
        color: 'negative',
        message: t('photos.dateNotAllowed'),
        position: 'bottom',
        timeout: 10000,
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
      });
      continue;
    }

    if (props.photosCount + addedCount >= props.picMax) {
      Notify.create({
        color: 'warning',
        message: t('photos.limitReached'),
        position: 'bottom',
        timeout: 10000,
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
      });
      break;
    }

    validFiles.push(rawFile);
    addedCount++;
  }

  if (validFiles.length === 0) return;

  const saved = await processFiles({
    auditLocalId: props.auditLocalId,
    questionId: props.questionId,
    files: validFiles,
    pic_max: props.picMax,
  });

  if (saved > 0) {
    emit('photosAdded', saved);
  }

  if (errors.value.length) {
    console.error(...errors.value);

    Notify.create({
      message: `<div>Errors:</div>${errors.value
        .map(error => `<div>${error}</div>`)
        .join('')}`,
      html: true,
      color: 'negative',
      position: 'bottom',
      timeout: 10000,
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
    });
  }
};

const onFilesRejected = () => {
  const message = t('photos.limitUploadReached', { limit: FILES_INPUT_LIMIT });

  Notify.create({
    type: 'warning',
    timeout: 5000,
    message,
    actions: [
      {
        icon: 'close',
        color: 'dark',
        size: 'sm',
        round: true,
      },
    ],
  });
};
</script>

<style scoped>
.photo-file-input {
  display: none;
  visibility: hidden;
}
</style>
