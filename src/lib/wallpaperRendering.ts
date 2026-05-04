import type { Wallpaper } from '../types';

export function renderWallpaper(wp: Wallpaper, w = 1600, h = 1000) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  wp.paint(ctx, w, h);

  const sample = document.createElement('canvas');
  sample.width = 32;
  sample.height = 20;
  const sampleCtx = sample.getContext('2d');
  sampleCtx?.drawImage(c, 0, 0, 32, 20);
  const data = sampleCtx?.getImageData(0, 0, 32, 20).data;
  let luminance = 0;
  if (data) {
    for (let i = 0; i < data.length; i += 4) luminance += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    luminance /= data.length / 4;
  }

  return { dataUrl: c.toDataURL('image/jpeg', 0.85), luminance };
}
