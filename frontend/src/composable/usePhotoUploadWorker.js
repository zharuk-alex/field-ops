import { ref } from 'vue';
import { photosTable } from '@/boot/db';
import { useI18n } from 'vue-i18n';
import { makeResizesWorkerOrMain } from '@/workers';
import { abToBase64DataUrl } from '@/helpers';

export function usePhotoUploadWorker() {
  const { t } = useI18n();
  const progress = ref(0);
  const isProcessing = ref(false);
  const errors = ref([]);

  const processFiles = async ({
    files,
    auditLocalId,
    questionId = null,
    pic_max = 50,
  }) => {
    if (!files?.length || !auditLocalId) return 0;

    isProcessing.value = true;
    progress.value = 0;
    errors.value = [];

    const query = questionId
      ? photosTable
          .where('[auditLocalId+questionId]')
          .equals([auditLocalId, questionId])
      : photosTable.where('auditLocalId').equals(auditLocalId);

    const existing = await query.toArray();

    const existingHashes = new Set(existing.map(i => i.hash).filter(Boolean));

    const total = files.length;
    let processed = 0;
    let saved = 0;

    const existingCount = existing.length;

    for (const file of files) {
      if (existingCount + saved >= pic_max) break;

      try {
        const { fullAb, thumbAb, lastModified, added, mime } =
          await makeResizesWorkerOrMain({ file, timeout: 60000 });

        const hashBuf = await crypto.subtle.digest(
          'SHA-1',
          new Uint8Array(fullAb),
        );
        const hash = Array.from(new Uint8Array(hashBuf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (existingHashes.has(hash)) {
          errors.value.push(
            t('photos.alreadyExist', { filename: file.name }),
          );
          processed++;
          progress.value = Math.round((processed / total) * 100);
          continue;
        }

        const mimeType = mime || 'image/jpeg';

        const thumbBase64 = await abToBase64DataUrl(thumbAb, mimeType);
        const fullBase64 = await abToBase64DataUrl(fullAb, mimeType);

        await photosTable.add({
          auditLocalId,
          questionId: questionId || null,
          hash,
          mime: mimeType,
          added,
          lastModified,
          thumbBase64,
          fullBase64,
          status: 'pending',
        });

        existingHashes.add(hash);
        saved++;
      } catch (e) {
        errors.value.push(e?.message || String(e));
      } finally {
        processed++;
        progress.value = Math.round((processed / total) * 100);
      }
    }

    isProcessing.value = false;
    return saved;
  };

  return { processFiles, progress, isProcessing, errors };
}
