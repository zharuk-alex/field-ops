import { ref, onMounted, onUnmounted } from 'vue';
import { usePhotoSync } from './usePhotoSync';
import { auditsDataTable, photosTable } from '@/boot/db';
import { useGlobMixin } from './useGlobalMixin';

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine);
  const { retryFailedPhotos } = usePhotoSync();
  const { $store } = useGlobMixin();

  let retryTimeout = null;

  const handleOnlineStatus = async () => {
    const online = navigator.onLine;
    isOnline.value = online;
    $store.commit('uiServices/SET_IS_ONLINE', online);

    if (!online) {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      return;
    }

    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }

    retryTimeout = setTimeout(async () => {
      try {
        const allAudits = await auditsDataTable.toArray();

        for (const audit of allAudits) {
          const failedPhotos = await photosTable
            .where('[auditLocalId+status]')
            .equals([audit.localId, 'error'])
            .count();

          if (failedPhotos > 0 && audit.serverId && audit.answerMapping) {
            try {
              await retryFailedPhotos(
                audit.localId,
                audit.serverId,
                audit.answerMapping,
              );

              const remainingFailed = await photosTable
                .where('[auditLocalId+status]')
                .equals([audit.localId, 'error'])
                .count();

              if (remainingFailed === 0) {
                await photosTable
                  .where('auditLocalId')
                  .equals(audit.localId)
                  .delete();
                await auditsDataTable.delete(audit.localId);
              }
            } catch (error) {
              console.error('Retry photos error:', error);
            }
          }
        }
      } catch (error) {
        console.error('Network status handler error:', error);
      }
    }, 2000);
  };

  onMounted(() => {
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnlineStatus);
    window.removeEventListener('offline', handleOnlineStatus);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
  });

  return {
    isOnline,
  };
}
