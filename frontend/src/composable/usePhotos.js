import { liveQuery } from 'dexie';
import { photosTable } from '@/boot/db';
import { ref, computed, onBeforeUnmount, watch, isRef, toRef } from 'vue';

export function usePhotos(auditLocalId, questionId = null) {
  const photos = ref([]);
  const photosCount = computed(() => photos.value.length ?? 0);

  let subscription = null;

  const subscribeToPhotos = (newAuditId, newQuestionId) => {
    if (subscription) subscription.unsubscribe();

    if (!newAuditId) {
      photos.value = [];
      return;
    }

    const query = newQuestionId
      ? liveQuery(() =>
          photosTable
            .where('[auditLocalId+questionId]')
            .equals([newAuditId, newQuestionId])
            .toArray(),
        )
      : liveQuery(() =>
          photosTable.where('auditLocalId').equals(newAuditId).toArray(),
        );

    subscription = query.subscribe({
      next: result => {
        photos.value = result;
      },
      error: err => {
        console.error('LiveQuery photos error', err);
      },
    });
  };

  const questionIdRef = questionId ? (isRef(questionId) ? questionId : toRef(questionId)) : ref(null);

  watch(
    [auditLocalId, questionIdRef],
    ([newAuditId, newQuestionId]) => {
      subscribeToPhotos(newAuditId, newQuestionId);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (subscription) subscription.unsubscribe();
  });

  return {
    photos,
    photosCount,
  };
}
