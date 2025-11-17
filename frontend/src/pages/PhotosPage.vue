<template>
  <AppBottomDialog v-model="showDialog" @hide="dialogClose">
    <template #header>
      <div class="text-h6 flex">
        {{ t('photos.gallery') }}
        <q-space />
        <q-btn flat color="primary" icon="mdi-dots-horizontal">
          <q-menu max-height="130px" auto-close>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-ripple
                :disable="photos.length === 0"
                @click="deleteCurrentPhoto"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-delete" color="negative" />
                </q-item-section>
                <q-item-section>{{ t('delete') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <div class="text-caption text-grey">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>
    </template>

    <div v-if="photos.length > 0 && currentPhoto" class="gallery-container">
      <div class="main-image-container">
        <img
          :src="currentPhoto.fullBase64"
          :alt="`Photo ${currentIndex + 1}`"
          class="main-image"
        />
        <div v-if="currentPhotoQuestion" class="photo-info">
          <q-card class="my-card">
            <q-card-section>
              {{ t('photos.answerToQuestion') }}: "{{
                currentPhotoQuestion.questionText
              }}"
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="thumbnails-container">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="thumbnail-wrapper"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        >
          <img
            :src="photo.thumbBase64"
            :alt="`Thumbnail ${index + 1}`"
            class="thumbnail"
          />
        </div>
      </div>
    </div>

    <div v-else class="no-photos">
      <q-icon name="mdi-image-off" size="64px" color="grey" />
      <div class="text-grey q-mt-md">{{ t('photos.noPhotos') }}</div>
    </div>

    <template #footer>
      <div class="flex" style="height: 64px">
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
        <BtnPhotoAdd
          :audit-local-id="auditLocalId"
          :photos-count="photosCount"
          :pic-max="50"
        />
        <q-separator vertical />
        <div class="col"></div>
      </div>
    </template>
  </AppBottomDialog>
</template>

<script setup>
import AppBottomDialog from 'src/components/AppBottomDialog.vue';
import { ref, computed, nextTick, watch } from 'vue';
import { useGlobMixin } from 'src/composable/useGlobalMixin';
import { usePhotos } from 'src/composable/usePhotos';
import { useI18n } from 'vue-i18n';
import { photosTable } from 'src/boot/db';
import BtnPhotoAdd from 'src/components/pwa/BtnPhotoAdd.vue';

const { $route, $router, $store } = useGlobMixin();
const { t } = useI18n();
const showDialog = ref(true);

const auditLocalId = computed(() => $route.params.id);
const questionId = computed(() => $route.query.questionId || null);

const { photos, photosCount } = usePhotos(auditLocalId, questionId);
const currentIndex = ref(0);

const currentPhoto = computed(() => photos.value[currentIndex.value]);

const currentAudit = computed(() => $store.getters['pwaAudits/currentAudit']);

const currentPhotoQuestion = computed(() => {
  if (!currentPhoto.value?.questionId || !currentAudit.value) return null;
  return currentAudit.value.questions?.find(
    q => q.id === currentPhoto.value.questionId,
  );
});

watch(
  () => $route.params.num,
  newNum => {
    if (newNum) {
      const index = parseInt(newNum) - 1;
      if (index >= 0 && index < photos.value.length) {
        currentIndex.value = index;
      }
    }
  },
  { immediate: true },
);

const deleteCurrentPhoto = async () => {
  if (!currentPhoto.value) return;

  try {
    await photosTable.delete(currentPhoto.value.id);

    if (photos.value.length === 0) {
      showDialog.value = false;
    } else if (currentIndex.value >= photos.value.length) {
      currentIndex.value = photos.value.length - 1;
    }
  } catch (error) {
    console.error('Delete photo error', error);
  }
};

const dialogClose = async () => {
  await nextTick();
  if ($route.meta?.parentRoute) {
    const { id } = $route?.params ?? {};
    $router.push({ name: $route.meta?.parentRoute, params: { id } });
  }
};
</script>

<style lang="scss" scoped>
.gallery-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.main-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
  position: relative;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
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

.thumbnails-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
}

.thumbnail-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &.active {
    border-color: var(--q-primary);
  }

  &:hover {
    opacity: 0.8;
  }
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
