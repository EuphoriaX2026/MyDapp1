/** Export a square JPEG data URL from a loaded image with pan/zoom in a crop viewport. */
export function cropImageToSquare(
  image: HTMLImageElement,
  scale: number,
  offsetX: number,
  offsetY: number,
  cropSize: number,
  outputSize = 400,
  quality = 0.92
): string {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  const ix = (cropSize - dw) / 2 + offsetX;
  const iy = (cropSize - dh) / 2 + offsetY;

  const sx = Math.max(0, -ix / scale);
  const sy = Math.max(0, -iy / scale);
  const sw = Math.min(image.naturalWidth - sx, cropSize / scale);
  const sh = Math.min(image.naturalHeight - sy, cropSize / scale);

  const destScale = outputSize / cropSize;
  const dx = Math.max(0, ix) * destScale;
  const dy = Math.max(0, iy) * destScale;
  const dSizeW = sw * scale * destScale;
  const dSizeH = sh * scale * destScale;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dSizeW, dSizeH);

  return canvas.toDataURL('image/jpeg', quality);
}

export function getInitialCoverScale(
  naturalWidth: number,
  naturalHeight: number,
  cropSize: number
): number {
  return Math.max(cropSize / naturalWidth, cropSize / naturalHeight);
}
