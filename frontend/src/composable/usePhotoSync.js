import { ref } from 'vue';
import { api } from '@/boot/axios';
import { photosTable } from '@/boot/db';

export function usePhotoSync() {
  const isSyncing = ref(false);
  const syncProgress = ref(0);
  const syncErrors = ref([]);

  async function uploadPhoto(photo, auditId, answerId = null) {
    const base64Data = photo.fullBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: photo.mime || 'image/jpeg' });

    const formData = new FormData();
    formData.append('photo', blob, `photo_${photo.id}.jpg`);
    formData.append('auditId', auditId);
    if (answerId) {
      formData.append('answerId', answerId);
    }

    const response = await api.post('/api/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async function syncAuditPhotos(auditLocalId, auditId, answerMapping = {}) {
    isSyncing.value = true;
    syncProgress.value = 0;
    syncErrors.value = [];

    try {
      const pendingPhotos = await photosTable
        .where('auditLocalId')
        .equals(auditLocalId)
        .and(photo => photo.status === 'pending')
        .toArray();

      if (pendingPhotos.length === 0) {
        return 0;
      }

      const total = pendingPhotos.length;
      let synced = 0;

      for (let i = 0; i < pendingPhotos.length; i++) {
        const photo = pendingPhotos[i];
        try {
          const answerId = photo.questionId
            ? answerMapping[photo.questionId]
            : null;
          const uploadedPhoto = await uploadPhoto(photo, auditId, answerId);

          await photosTable.update(photo.id, {
            status: 'synced',
            serverId: uploadedPhoto.id,
            url: uploadedPhoto.url,
            thumbnailUrl: uploadedPhoto.thumbnailUrl,
          });

          synced++;
        } catch (error) {
          console.error('Failed to sync photo:', error);
          syncErrors.value.push({
            photoId: photo.id,
            error: error.message || 'Upload failed',
          });

          await photosTable.update(photo.id, {
            status: 'error',
            error: error.message || 'Upload failed',
          });
        } finally {
          syncProgress.value = Math.round(((i + 1) / total) * 100);
        }
      }

      return synced;
    } finally {
      isSyncing.value = false;
    }
  }

  async function retryFailedPhotos(auditLocalId, auditId, answerMapping = {}) {
    isSyncing.value = true;
    syncProgress.value = 0;
    syncErrors.value = [];

    try {
      const errorPhotos = await photosTable
        .where('auditLocalId')
        .equals(auditLocalId)
        .and(photo => photo.status === 'error')
        .toArray();

      if (errorPhotos.length === 0) {
        return 0;
      }

      await Promise.all(
        errorPhotos.map(photo =>
          photosTable.update(photo.id, { status: 'pending', error: null }),
        ),
      );

      return await syncAuditPhotos(auditLocalId, auditId, answerMapping);
    } finally {
      isSyncing.value = false;
    }
  }

  async function deletePhoto(photoId) {
    const photo = await photosTable.get(photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }

    if (photo.status === 'synced' && photo.serverId) {
      try {
        await api.delete(`/api/photos/${photo.serverId}`);
      } catch (error) {
        console.error('Failed to delete photo from server:', error);
      }
    }

    await photosTable.delete(photoId);
  }

  async function getSyncStatus(auditLocalId) {
    const photos = await photosTable
      .where('auditLocalId')
      .equals(auditLocalId)
      .toArray();

    const pending = photos.filter(p => p.status === 'pending').length;
    const synced = photos.filter(p => p.status === 'synced').length;
    const error = photos.filter(p => p.status === 'error').length;

    return {
      total: photos.length,
      pending,
      synced,
      error,
      isFullySynced: pending === 0 && error === 0,
    };
  }

  return {
    isSyncing,
    syncProgress,
    syncErrors,
    uploadPhoto,
    syncAuditPhotos,
    retryFailedPhotos,
    deletePhoto,
    getSyncStatus,
  };
}
