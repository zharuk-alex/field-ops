<template>
  <q-page padding>
    <div v-if="loading || !currentAudit" class="text-center q-pa-xl">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md text-grey-7">{{ t('loadingAudit') }}</div>
    </div>

    <div v-else class="flex column">
      <div class="q-mb-md">
        <div class="text-h5">{{ currentAudit.name }}</div>
        <div v-if="currentAudit.description" class="text-caption text-grey-7">
          {{ currentAudit.description }}
        </div>
        <div v-if="currentAudit.location" class="q-mt-sm">
          <q-chip
            dense
            icon="place"
            :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-3'"
          >
            {{ currentAudit.location.name }}
          </q-chip>
        </div>
      </div>

      <div class="q-gutter-md">
        <q-card
          v-for="(question, index) in questions"
          :key="question.id"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="row items-start q-mb-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">
                  {{ index + 1 }}. {{ question.questionText }}
                  <span v-if="question.required" class="text-red">*</span>
                </div>
                <div class="text-caption text-grey-6">
                  {{ t(`questionType.${question.type}`) }}
                </div>
              </div>
            </div>

            <q-btn-toggle
              v-if="question.type === 'boolean'"
              :model-value="answers[question.id]"
              :options="[
                { label: t('yes'), value: true },
                { label: t('no'), value: false },
              ]"
              toggle-color="primary"
              @update:model-value="saveAnswer(question.id, $event)"
            />

            <q-option-group
              v-else-if="question.type === 'choice' && question.choices"
              :model-value="answers[question.id]"
              :options="formatChoices(question.choices)"
              type="radio"
              @update:model-value="saveAnswer(question.id, $event)"
            />

            <q-select
              v-else-if="question.type === 'multipleChoice' && question.choices"
              :model-value="answers[question.id]"
              :options="formatChoices(question.choices)"
              multiple
              filled
              behavior="dialog"
              :label="t('selectOptions')"
              emit-value
              map-options
              use-chips
              bottom-slots
              :popup-content-style="[maxSelectDialogHeight]"
              @update:model-value="saveAnswer(question.id, $event)"
            >
              <template #after-options>
                <q-separator />
                <q-card-actions>
                  <q-btn
                    icon="mdi-close"
                    flat
                    square
                    color="grey-8"
                    class="fit col"
                    v-close-popup
                    @click="showDialog = false"
                  />
                  <q-separator vertical />
                  <div class="col"></div>
                </q-card-actions>
              </template>
            </q-select>

            <q-input
              v-else-if="question.type === 'number'"
              :model-value="answers[question.id]"
              type="number"
              filled
              :label="t('enterNumber')"
              @update:model-value="saveAnswer(question.id, $event)"
            />

            <q-rating
              v-else-if="question.type === 'rating'"
              :model-value="answers[question.id]"
              size="2em"
              color="orange"
              icon="star_border"
              icon-selected="star"
              :max="5"
              @update:model-value="saveAnswer(question.id, $event)"
            />

            <q-input
              v-else-if="question.type === 'text'"
              :model-value="answers[question.id]"
              filled
              type="textarea"
              :label="t('enterText')"
              rows="3"
              @update:model-value="saveAnswer(question.id, $event)"
            />

            <div
              v-else-if="question.type === 'photo'"
              class="row q-gutter-sm items-center"
            >
              <div
                v-for="photo in getQuestionPhotos(question.id)"
                :key="photo.id"
                class="thumbnail-preview"
                @click="openPhoto(photo, question.id)"
              >
                <img :src="photo.thumbBase64" class="thumbnail-image" />
              </div>
              <BtnPhotoAdd
                :audit-local-id="currentAudit.localId"
                :question-id="question.id"
                :photos-count="getQuestionPhotos(question.id).length"
                :pic-max="50"
                :restrict-photo-age="currentAudit.restrictPhotoAge"
                icon-only
                @photos-added="handlePhotosAdded(question.id)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ t('comment') }}
          </div>
          <q-input
            v-model="auditComment"
            filled
            type="textarea"
            :label="t('enterComment')"
            rows="3"
            :hint="t('optional')"
            @update:model-value="saveComment"
          />
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showClearConfirmDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">
            {{ t('clearAudit') }}
          </div>
        </q-card-section>

        <q-card-section>
          {{ t('clearAuditConfirmMessage') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('cancel')" v-close-popup />
          <q-btn
            :label="t('confirm')"
            color="negative"
            :loading="clearing"
            @click="confirmClearAudit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <LocationConfirmDialog
      v-model="showStartLocationDialog"
      :title="t('setStartLocation')"
      :location-name="currentAudit?.location?.name"
      :target-location="targetLocationForStart"
      :confirm-label="t('confirm')"
      @confirm="handleStartLocationConfirm"
      @cancel="handleStartLocationCancel"
    />

    <LocationConfirmDialog
      v-model="showEndLocationDialog"
      :title="t('setEndLocation')"
      :location-name="currentAudit?.location?.name"
      :target-location="targetLocationForEnd"
      :confirm-label="t('submit')"
      @confirm="handleEndLocationConfirm"
      @cancel="handleEndLocationCancel"
    />

    <RouterView name="photos" />

    <Teleport v-if="isMounted && currentAudit" to="#app-footer">
      <q-linear-progress :value="progress / 100" color="primary" size="18px">
        <div class="absolute-full flex flex-center">
          <q-badge color="white" text-color="grey">
            {{ t('progress') }}: {{ progress }}% ({{ answeredCount }}/{{
              totalQuestions
            }})
          </q-badge>
        </div>
      </q-linear-progress>
      <div class="flex no-wrap" style="height: 64px">
        <BtnGallery :photos-count="photosCount" />
        <q-separator vertical />
        <BtnPhotoAdd
          :audit-local-id="currentAudit.localId"
          :photos-count="photosCount"
          :pic-max="50"
        />
        <q-separator vertical />
        <BtnSubmit
          @click="submit"
          :loading="submitting"
          :disable="!canSubmit"
        />
      </div>
    </Teleport>
    <q-dialog v-model="submitting" persistent style="z-index: 6005">
      <q-spinner-gears color="white" size="3rem" :thickness="5" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { usePhotos } from '@/composable/usePhotos';
import BtnSubmit from '@/components/pwa/BtnSubmit.vue';
import BtnGallery from 'src/components/pwa/BtnGallery.vue';
import BtnPhotoAdd from 'src/components/pwa/BtnPhotoAdd.vue';
import LocationConfirmDialog from '@/components/pwa/LocationConfirmDialog.vue';

const { $store, t, $router, $route } = useGlobMixin();
const clearAuditTrigger = inject('clearAuditTrigger', ref(0));

const currentAudit = computed(() => $store.getters['pwaAudits/currentAudit']);
const answers = computed(() => $store.getters['pwaAudits/answers']);
const progress = computed(() => $store.getters['pwaAudits/progress']);
const hydrated = computed(() => $store.getters['pwaAudits/hydrated']);
const isOnline = computed(() => $store.getters['uiServices/isOnline']);

const auditLocalId = computed(() => currentAudit.value?.localId);
const { photosCount } = usePhotos(auditLocalId);

const submitting = ref(false);
const loading = ref(true);
const isMounted = ref(false);
const showClearConfirmDialog = ref(false);
const clearing = ref(false);
const showStartLocationDialog = ref(false);
const showEndLocationDialog = ref(false);
const auditComment = ref('');

const questions = computed(() => currentAudit.value?.questions || []);
const totalQuestions = computed(() => questions.value.length);
const answeredCount = computed(() => Object.keys(answers.value).length);

const questionPhotosMap = ref(new Map());

const canSubmit = computed(() => {
  const requiredQuestions = questions.value.filter(q => q.required);
  return requiredQuestions.every(q => answers.value[q.id] !== undefined);
});

const targetLocationForStart = computed(() => {
  const location = currentAudit.value?.location;
  if (!location?.lat || !location?.lng) return null;
  return {
    ...location,
    latitude: parseFloat(location.lat),
    longitude: parseFloat(location.lng),
  };
});

const targetLocationForEnd = computed(() => {
  const location = currentAudit.value?.location;
  if (!location?.lat || !location?.lng) return null;
  return {
    ...location,
    latitude: parseFloat(location.lat),
    longitude: parseFloat(location.lng),
  };
});

const maxSelectDialogHeight = computed(() => {
  return {
    maxHeight: `calc(80vh - 64px)`,
    zIndex: '6003',
  };
});

watch(
  [auditLocalId, questions],
  ([newAuditId, newQuestions]) => {
    questionPhotosMap.value.clear();

    if (!newAuditId || !newQuestions?.length) return;

    const photoQuestions = newQuestions.filter(q => q.type === 'photo');

    photoQuestions.forEach(question => {
      const questionIdRef = computed(() => question.id);
      const { photos } = usePhotos(auditLocalId, questionIdRef);
      questionPhotosMap.value.set(question.id, photos);
    });
  },
  { immediate: true },
);

function getQuestionPhotos(questionId) {
  const photosRef = questionPhotosMap.value.get(questionId);
  return photosRef?.value || [];
}

function openPhoto(photo, questionId) {
  const photos = getQuestionPhotos(questionId);
  const index = photos.findIndex(p => p.id === photo.id);
  if (index >= 0) {
    $router.push({
      name: 'audit-perform:photos',
      params: { num: index + 1 },
      // query: { questionId },
    });
  }
}

function formatChoices(choices) {
  if (Array.isArray(choices)) {
    return choices.map(c => ({
      label: typeof c === 'string' ? c : c.label || c.value,
      value: typeof c === 'string' ? c : c.value,
    }));
  }
  return [];
}

function saveAnswer(questionId, value) {
  $store.dispatch('pwaAudits/setAnswer', { questionId, value });
}

function handlePhotosAdded(questionId) {
  const photos = getQuestionPhotos(questionId);
  if (photos.length > 0) {
    saveAnswer(questionId, true);
  }
}

async function submit() {
  showEndLocationDialog.value = true;
}

async function performSubmit() {
  try {
    submitting.value = true;

    await $store.dispatch('pwaAudits/submitAudit');

    $store.dispatch('uiServices/showNotification', {
      message: t('auditSubmittedSuccessfully'),
      color: 'positive',
    });

    $router.push({ name: 'home' });
  } catch (err) {
    console.error('Submit audit error', err);

    if (err.message === 'Some photos failed to upload') {
      $store.dispatch('uiServices/showNotification', {
        message: t('auditSubmittedWithPhotoErrors'),
        color: 'warning',
      });
      $router.push({ name: 'home' });
    } else {
      $store.dispatch('uiServices/showNotification', {
        message: err?.response?.data?.message || t('failedToSubmitAudit'),
        color: 'negative',
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function confirmClearAudit() {
  try {
    clearing.value = true;

    const templateId = currentAudit.value?.templateId;
    const locationId = currentAudit.value?.locationId;
    const localId = currentAudit.value?.localId;

    if (!localId) {
      throw new Error('No audit localId');
    }

    await $store.dispatch('pwaAudits/clearAudit', { localId });

    showClearConfirmDialog.value = false;

    $store.dispatch('uiServices/showNotification', {
      message: t('auditCleared'),
      color: 'positive',
    });

    const existingAudit = await $store.dispatch('pwaAudits/findExistingAudit', {
      templateId,
      locationId,
    });

    if (existingAudit) {
      $router.replace({
        name: 'audit-perform',
        params: { id: existingAudit.localId },
      });
    } else {
      const template = await $store.dispatch(
        'pwaTemplates/getTemplateById',
        templateId,
      );

      if (template) {
        const newAudit = await $store.dispatch('pwaAudits/startAudit', {
          template,
          locationId,
        });

        await $router.replace({
          name: 'audit-perform',
          params: { id: newAudit.localId },
        });
        checkAndShowStartLocationDialog();
      } else {
        $router.push({ name: 'home' });
      }
    }
  } catch (err) {
    console.error('Clear audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: err?.message || t('failedToClearAudit'),
      color: 'negative',
    });
  } finally {
    clearing.value = false;
  }
}

async function loadAudit() {
  const auditLocalId = $route.params.id;

  if (!auditLocalId) {
    console.error('No audit ID in $route');
    $router.push({ name: 'home' });
    return;
  }

  if (!hydrated.value) {
    const checkHydration = setInterval(() => {
      if (hydrated.value) {
        clearInterval(checkHydration);
        checkAuditLoaded(auditLocalId);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(checkHydration);
      if (!hydrated.value) {
        console.warn('Hydration timeout');
        checkAuditLoaded(auditLocalId);
      }
    }, 5000);
  } else {
    checkAuditLoaded(auditLocalId);
  }
}

async function checkAuditLoaded(auditLocalId) {
  if (currentAudit.value?.localId === auditLocalId) {
    loading.value = false;
    checkAndShowStartLocationDialog();
    return;
  }

  try {
    const loaded = await $store.dispatch(
      'pwaAudits/loadAuditByLocalId',
      auditLocalId,
    );

    if (!loaded) {
      console.error('Audit not found:', auditLocalId);
      $store.dispatch('uiServices/showNotification', {
        message: t('auditNotFound'),
        color: 'negative',
      });
      $router.push({ name: 'home' });
    } else {
      checkAndShowStartLocationDialog();
    }
  } catch (err) {
    console.error('Load audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadAudit'),
      color: 'negative',
    });
    $router.push({ name: 'home' });
  } finally {
    loading.value = false;
  }
}

function checkAndShowStartLocationDialog() {
  if (!currentAudit.value) return;

  if (!currentAudit.value.startLocation && !currentAudit.value.startedAt) {
    showStartLocationDialog.value = true;
  }
}

async function handleStartLocationConfirm(gpsData) {
  try {
    await $store.dispatch('pwaAudits/setStartLocation', {
      localId: currentAudit.value.localId,
      location: gpsData,
    });
  } catch (err) {
    console.error('Save start location error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToSaveStartLocation'),
      color: 'negative',
    });
  }
}

function handleStartLocationCancel() {
  showStartLocationDialog.value = false;
  $router.push({ name: 'home' });
}

async function handleEndLocationConfirm(gpsData) {
  try {
    await $store.dispatch('pwaAudits/setEndLocation', {
      localId: currentAudit.value.localId,
      location: gpsData,
    });

    if (!isOnline.value) {
      $store.dispatch('uiServices/showNotification', {
        message: t('auditSavedOffline'),
        color: 'info',
      });
      $router.push({ name: 'home' });
      return;
    }

    await performSubmit();
  } catch (err) {
    console.error('Save end location error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToSaveEndLocation'),
      color: 'negative',
    });
  }
}

function handleEndLocationCancel() {
  showEndLocationDialog.value = false;
}

function saveComment(value) {
  $store.dispatch('pwaAudits/setComment', value);
}

watch(
  currentAudit,
  newAudit => {
    if (newAudit?.meta?.comment) {
      auditComment.value = newAudit.meta.comment;
    } else {
      auditComment.value = '';
    }
  },
  { immediate: true },
);

watch(clearAuditTrigger, newVal => {
  if (newVal > 0) {
    showClearConfirmDialog.value = true;
  }
});

onMounted(() => {
  isMounted.value = true;
  loadAudit();
});
</script>

<style lang="scss" scoped>
.thumbnail-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition:
    border-color 0.2s,
    opacity 0.2s;

  &:hover {
    opacity: 0.8;
    border-color: var(--q-primary);
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
