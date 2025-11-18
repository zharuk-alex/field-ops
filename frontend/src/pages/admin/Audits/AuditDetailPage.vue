<template>
  <q-page padding>
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md text-grey-7">{{ t('loading') }}...</div>
    </div>

    <div v-else-if="audit">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-caption text-grey-7">
            {{ t('audit') }} #{{ audit.id }}
          </div>
        </div>
        <q-badge :color="getStatusColor(audit.status)" class="text-subtitle2">
          {{ t(`auditStatus.${audit.status}`) }}
        </q-badge>
      </div>

      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('generalInfo') }}</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('template') }}</div>
              <div class="text-body1">{{ audit.template?.name || '-' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('company') }}</div>
              <div class="text-body1">{{ audit.company?.name || '-' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('location') }}</div>
              <div class="text-body1">
                {{ audit.location?.name || '-' }}
                <div v-if="audit.location?.address" class="text-caption">
                  {{ audit.location.address }}
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('assignee') }}</div>
              <div class="text-body1">
                <div v-if="audit.assignee">
                  {{ audit.assignee.firstName }} {{ audit.assignee.lastName }}
                  <div class="text-caption">{{ audit.assignee.email }}</div>
                </div>
                <span v-else>-</span>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('startedAt') }}</div>
              <div class="text-body1">
                {{ audit.startsAt ? formatDateTime(audit.startsAt) : '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('completedAt') }}</div>
              <div class="text-body1">
                {{ audit.endsAt ? formatDateTime(audit.endsAt) : '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">{{ t('createdAt') }}</div>
              <div class="text-body1">
                {{ formatDateTime(audit.createdAt) }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">
                {{ t('workDuration') }}
              </div>
              <div class="text-body1">
                {{ formatWorkDuration(audit.startsAt, audit.endsAt) }}
              </div>
            </div>
          </div>
          <div class="row q-mt-sm q-col-gutter-md">
            <div v-if="startLocationDistance !== null" class="col-12 col-md-6">
              <div class="text-caption text-grey-7">
                <q-icon name="mdi-map-marker-distance" />
                {{ t('startLocationRadius') }}
              </div>
              <div class="text-body1">
                {{ formatDistance(startLocationDistance) }}
              </div>
            </div>

            <div v-if="endLocationDistance !== null" class="col-12 col-md-6">
              <div class="text-caption text-grey-7">
                <q-icon name="mdi-map-marker-distance" />
                {{ t('endLocationRadius') }}
              </div>
              <div class="text-body1">
                {{ formatDistance(endLocationDistance) }}
              </div>
            </div>
          </div>

          <div v-if="audit.meta?.comment" class="row q-mt-sm q-col-gutter-md">
            <div class="col-12">
              <div class="text-caption text-grey-7">
                <q-icon name="mdi-comment-outline" />
                {{ t('comment') }}
              </div>
              <div class="text-body1">{{ audit.meta.comment }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-if="audit.items && audit.items.length > 0" class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            {{ t('questionsAndAnswers') }}
            <q-badge color="grey" class="q-ml-sm">
              {{ audit.items.length }}
            </q-badge>
          </div>

          <q-list separator>
            <q-item
              v-for="(item, index) in audit.items"
              :key="item.id"
              class="q-pa-md"
            >
              <q-item-section>
                <div class="text-subtitle1 text-weight-medium q-mb-sm">
                  {{ index + 1 }}. {{ item.questionText }}
                  <q-badge
                    v-if="item.required"
                    color="red"
                    label="*"
                    class="q-ml-xs"
                  />
                  <q-badge color="grey" class="q-ml-xs">
                    {{ t(`questionType.${item.type}`) }}
                  </q-badge>
                </div>

                <div
                  v-if="item.answers && item.answers.length > 0"
                  class="q-mt-sm"
                >
                  <div
                    v-for="answer in item.answers"
                    :key="answer.id"
                    class="q-mb-sm"
                  >
                    <div class="text-body1">
                      <strong>{{ t('answer') }}:</strong>
                      <span class="q-ml-sm">
                        {{ formatAnswerValue(answer.value, item.type) }}
                      </span>
                    </div>

                    <div v-if="answer.comment" class="text-body2 q-mt-xs">
                      <strong>{{ t('comment') }}:</strong>
                      {{ answer.comment }}
                    </div>

                    <div
                      v-if="answer.photos && answer.photos.length > 0"
                      class="q-mt-sm"
                    >
                      <div class="text-caption text-grey-7 q-mb-xs">
                        {{ t('photos') }}: {{ answer.photos.length }}
                      </div>
                      <div class="row q-gutter-sm">
                        <div
                          v-for="photo in answer.photos"
                          :key="photo.id"
                          class="photo-thumbnail"
                          @click="
                            openPhotoDialog(photo, item.question.questionText)
                          "
                        >
                          <img
                            :src="photo.thumbnailUrl || photo.url"
                            :alt="'Photo'"
                            class="photo-thumbnail-img"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ formatDateTime(answer.createdAt) }}
                    </div>
                  </div>
                </div>

                <div v-else class="text-grey-7 q-mt-sm">
                  {{ t('noAnswer') }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-if="audit.photos && audit.photos.length > 0">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            {{ t('allPhotos') }}
            <q-badge color="grey" class="q-ml-sm">
              {{ audit.photos.length }}
            </q-badge>
          </div>

          <div class="row q-gutter-md">
            <div
              v-for="photo in audit.photos"
              :key="photo.id"
              class="photo-card"
              @click="openPhotoDialog(photo)"
            >
              <img
                :src="photo.thumbnailUrl || photo.url"
                :alt="'Photo'"
                class="photo-card-img"
              />
              <div class="photo-card-info">
                <div class="text-caption">
                  {{ formatDateTime(photo.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="error" size="64px" color="grey" />
      <div class="text-h6 q-mt-md text-grey-7">{{ t('auditNotFound') }}</div>
    </div>

    <PhotoDialog
      v-model="showPhotoDialog"
      :photo="selectedPhoto"
      :info-text="selectedPhotoQuestion"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { formatDateTime, formatWorkDuration } from '@/helpers/datetime';
import { useGeoposition } from '@/composable/useGeoposition';
import PhotoDialog from '@/components/admin/PhotoDialog.vue';
import { useGlobMixin } from 'src/composable/useGlobalMixin';

const { $store, t, $route, $router } = useGlobMixin();

const { calculateDistance, formatDistance } = useGeoposition();

const auditId = computed(() => $route.params.id);
const loading = ref(false);
const showPhotoDialog = ref(false);
const selectedPhoto = ref(null);
const selectedPhotoQuestion = ref(null);

const audit = computed(() => $store.getters['adminAudits/currentAudit']);

const startLocationDistance = computed(() => {
  if (
    !audit.value?.meta?.startLocation?.latitude ||
    !audit.value?.meta?.startLocation?.longitude ||
    !audit.value?.location?.lat ||
    !audit.value?.location?.lng
  ) {
    return null;
  }

  return calculateDistance(
    {
      latitude: audit.value.meta.startLocation.latitude,
      longitude: audit.value.meta.startLocation.longitude,
    },
    {
      latitude: parseFloat(audit.value.location.lat),
      longitude: parseFloat(audit.value.location.lng),
    },
  );
});

const endLocationDistance = computed(() => {
  if (
    !audit.value?.meta?.endLocation?.latitude ||
    !audit.value?.meta?.endLocation?.longitude ||
    !audit.value?.location?.lat ||
    !audit.value?.location?.lng
  ) {
    return null;
  }

  return calculateDistance(
    {
      latitude: audit.value.meta.endLocation.latitude,
      longitude: audit.value.meta.endLocation.longitude,
    },
    {
      latitude: parseFloat(audit.value.location.lat),
      longitude: parseFloat(audit.value.location.lng),
    },
  );
});

onMounted(async () => {
  if (!auditId.value) {
    $router.back();
    return;
  }

  loading.value = true;
  try {
    await $store.dispatch('adminAudits/getAudit', auditId.value);
  } catch (error) {
    console.error('Failed to load audit:', error);
  } finally {
    loading.value = false;
  }
});

function getStatusColor(status) {
  const colors = {
    draft: 'grey',
    pending: 'orange',
    'in-progress': 'blue',
    submitted: 'green',
    completed: 'positive',
    cancelled: 'negative',
  };
  return colors[status] || 'grey';
}

function formatAnswerValue(value, type) {
  if (value === null || value === undefined) return '-';

  if (type === 'boolean') {
    return value ? t('yes') : t('no');
  }

  if (type === 'multipleChoice' && Array.isArray(value)) {
    return value.join(', ');
  }

  if (type === 'photo') {
    return '';
  }

  return String(value);
}

function openPhotoDialog(photo, questionText = null) {
  selectedPhoto.value = photo;
  selectedPhotoQuestion.value = questionText;
  showPhotoDialog.value = true;
}
</script>

<style lang="scss" scoped>
.photo-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.photo-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-card {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
}

.photo-card-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.photo-card-info {
  margin-top: 4px;
}
</style>
