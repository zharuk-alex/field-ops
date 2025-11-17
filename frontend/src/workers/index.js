import PhotoWorkerArrayBufferCtor from './PhotoWorkerArrayBuffer.js?worker';
import { resizeToBlobMainThread } from '@/helpers';

const fmt = d => {
  const pad = n => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};

const photoBoxSize = {
  img: { maxWidth: 1200, maxHeight: 900 },
  thumb: { maxWidth: 250, maxHeight: 250 },
};

export function runPhotoWorkerArrayBuffer({
  file,
  timeout = 45000,
  signal,
} = {}) {
  if (!file) return Promise.reject(new Error('file is required'));

  return new Promise((resolve, reject) => {
    const worker = new PhotoWorkerArrayBufferCtor();
    let done = false;

    const cleanup = () => {
      try {
        worker.terminate();
      } catch (error) {
        console.error(error);
      }
      worker.onmessage = null;
      worker.onerror = null;
      if (timer) clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('photo worker timeout'));
    }, timeout);

    worker.onmessage = e => {
      if (done) return;
      const data = e.data || {};
      if (data?.error) {
        done = true;
        cleanup();
        reject(new Error(data.error));
        return;
      }

      done = true;
      cleanup();
      resolve(data);
    };

    worker.onerror = err => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(`Worker runtime error: ${err.message || err}`));
    };

    worker.postMessage({ file });
  });
}

export async function makeResizesWorkerOrMain({ file, timeout = 60000 }) {
  try {
    return await runPhotoWorkerArrayBuffer({ file, timeout });
  } catch (e) {
    const errorStr = String(e?.message || e);
    if (
      errorStr.includes('OFFSCREEN_UNSUPPORTED') ||
      errorStr.includes('OffscreenCanvas') ||
      errorStr.includes('not supported')
    ) {
      console.log('OffscreenCanvas not supported, using main thread fallback');
    } else {
      console.warn('Worker error, falling back to main thread:', errorStr);
    }

    const [imgBlob, thumbBlob] = await Promise.all([
      resizeToBlobMainThread(file, photoBoxSize.img, 0.82, 'image/jpeg'),
      resizeToBlobMainThread(file, photoBoxSize.thumb, 0.8, 'image/jpeg'),
    ]);

    const [fullAb, thumbAb] = await Promise.all([
      imgBlob.arrayBuffer(),
      thumbBlob.arrayBuffer(),
    ]);

    return {
      fullAb,
      thumbAb,
      lastModified: file.lastModified,
      added: fmt(new Date()),
      mime: 'image/jpeg',
    };
  }
}
