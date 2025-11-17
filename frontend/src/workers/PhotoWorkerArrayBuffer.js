if (typeof OffscreenCanvas === 'undefined') {
  self.postMessage({ error: 'OFFSCREEN_UNSUPPORTED' });
  throw new Error('OFFSCREEN_UNSUPPORTED');
}

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
  recog: { maxWidth: 3600, maxHeight: 3600 },
};

const getScaledSize = (srcW, srcH, box) => {
  const k = Math.min(box.maxWidth / srcW, box.maxHeight / srcH, 1);
  return { width: Math.round(srcW * k), height: Math.round(srcH * k) };
};

async function resizeToBlob(
  fileOrBlob,
  box,
  quality = 0.82,
  mime = 'image/jpeg',
) {
  const bmp = await createImageBitmap(fileOrBlob);
  const { width, height } = getScaledSize(bmp.width, bmp.height, box);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close?.();

  const blob = await canvas.convertToBlob({ type: mime, quality });
  return blob;
}

self.onmessage = async e => {
  const { file, hasRecog } = e.data;
  try {
    const [imgBlob, thumbBlob, recogBlob] = await Promise.all([
      resizeToBlob(file, photoBoxSize.img, 0.82, 'image/jpeg'),
      resizeToBlob(file, photoBoxSize.thumb, 0.8, 'image/jpeg'),
      hasRecog
        ? resizeToBlob(file, photoBoxSize.recog, 0.9, 'image/jpeg')
        : null,
    ]);

    const [fullAb, thumbAb, recogAb] = await Promise.all([
      imgBlob.arrayBuffer(),
      thumbBlob.arrayBuffer(),
      recogBlob ? recogBlob.arrayBuffer() : null,
    ]);

    self.postMessage(
      {
        fullAb,
        thumbAb,
        recogAb,
        lastModified: file.lastModified,
        added: fmt(new Date()),
        mime: 'image/jpeg',
      },
      [fullAb, thumbAb, ...(recogAb ? [recogAb] : [])],
    );
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
