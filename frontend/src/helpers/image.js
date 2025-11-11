export const abToBase64DataUrl = (ab, mime = 'image/jpeg') =>
  new Promise((resolve, reject) => {
    try {
      const blob = new Blob([ab], { type: mime });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (e) {
      reject(e);
    }
  });

export const microDelay = () => new Promise(r => setTimeout(r, 0));

export function getScaledSize(srcW, srcH, box) {
  const k = Math.min(box.maxWidth / srcW, box.maxHeight / srcH, 1);
  return { width: Math.round(srcW * k), height: Math.round(srcH * k) };
}

async function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = e => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function resizeToBlobMainThread(
  fileOrBlob,
  box,
  quality = 0.82,
  mime = 'image/jpeg',
) {
  const img = await blobToImage(fileOrBlob);
  const { width, height } = getScaledSize(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    box,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise(resolve => {
    canvas.toBlob(b => resolve(b), mime, quality);
  });
  return blob;
}
