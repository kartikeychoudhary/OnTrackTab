import type { CachedUnsplashWallpaper } from '../types';

export interface UnsplashCacheState {
  items: CachedUnsplashWallpaper[];
  activeIndex: number;
  remaining?: number;
  limit?: number;
  queryKey?: string;
}

export const UNSPLASH_CACHE_KEY = 'ott-unsplash-cache-v1';

export function unsplashQueryKey(query: string) {
  return query.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean).sort().join(',');
}

function randomUnsplashQuery(query: string) {
  const parts = query.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return '';
  return parts[Math.floor(Math.random() * parts.length)];
}

function imageToDataUrl(url: string) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Image fetch failed ${res.status}`);
      return res.blob();
    })
    .then((blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    }));
}

function analyzeImageDataUrl(dataUrl: string, maxWidth = 3840) {
  return new Promise<{ dataUrl: string; luminance: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const sample = document.createElement('canvas');
      sample.width = 32;
      sample.height = 20;
      const sampleCtx = sample.getContext('2d');
      sampleCtx?.drawImage(canvas, 0, 0, 32, 20);
      const pixels = sampleCtx?.getImageData(0, 0, 32, 20).data;
      let luminance = 0;
      if (pixels) {
        for (let i = 0; i < pixels.length; i += 4) luminance += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
        luminance /= pixels.length / 4;
      }
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.82), luminance });
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}

export async function fetchUnsplashWallpaper(accessKey: string, query: string): Promise<{ wallpaper: CachedUnsplashWallpaper; remaining?: number; limit?: number }> {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  const selectedQuery = randomUnsplashQuery(query);
  if (selectedQuery) url.searchParams.set('query', selectedQuery);

  const res = await fetch(url.toString(), { headers: { Authorization: `Client-ID ${accessKey}` } });
  if (!res.ok) throw new Error(`Unsplash returned ${res.status}`);
  const remaining = Number(res.headers.get('x-ratelimit-remaining') || NaN);
  const limit = Number(res.headers.get('x-ratelimit-limit') || NaN);
  const photo = await res.json() as {
    id: string;
    alt_description?: string;
    description?: string;
    links?: { html?: string; download_location?: string };
    urls?: { regular?: string; full?: string; raw?: string };
    user?: { name?: string; location?: string };
  };
  const imageUrl = photo.urls?.raw
    ? `${photo.urls.raw}${photo.urls.raw.includes('?') ? '&' : '?'}w=3840&fit=max&q=85&fm=jpg`
    : photo.urls?.full || photo.urls?.regular;
  if (!imageUrl) throw new Error('Unsplash photo has no usable URL');

  const originalDataUrl = await imageToDataUrl(imageUrl);
  const analyzed = await analyzeImageDataUrl(originalDataUrl);
  return {
    remaining: Number.isFinite(remaining) ? remaining : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    wallpaper: {
      id: `unsplash:${photo.id}`,
      name: photo.alt_description || photo.description || 'Unsplash Photo',
      photographer: photo.user?.name || 'Unsplash',
      location: photo.user?.location || 'Unsplash',
      dataUrl: analyzed.dataUrl,
      luminance: analyzed.luminance,
      unsplashUrl: photo.links?.html || 'https://unsplash.com',
      downloadLocation: photo.links?.download_location,
      fetchedAt: Date.now(),
    },
  };
}
