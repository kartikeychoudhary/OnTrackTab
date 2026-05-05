import React from 'react';
import { EditToolbar } from './components/EditToolbar';
import { SettingsDialog, DEFAULT_SETTINGS } from './components/SettingsDialog';
import { StageBackground } from './components/StageBackground';
import { Topbar } from './components/Topbar';
import { WidgetStage } from './components/WidgetStage';
import { WallpaperCredit } from './components/widgets';
import { WALLPAPER_BANK } from './components/wallpapers';
import { TWEAK_DEFAULTS } from './constants/tweaks';
import { useStoredState } from './hooks/useStoredState';
import { useUnsplashWallpapers } from './hooks/useUnsplashWallpapers';
import { normalizeTweaks } from './lib/tweakMigration';
import { renderWallpaper } from './lib/wallpaperRendering';
import type { LikedWallpaper, RenderedWallpaper, Settings, Tweaks, WidgetId } from './types';

type Toast = {
  id: number;
  message: string;
  tone: 'success' | 'error';
};

export default function App() {
  const [tweaks, setTweaks] = useStoredState<Tweaks>('ott-tweaks', TWEAK_DEFAULTS);
  const [settings, setSettings] = useStoredState<Settings>('ott-settings', DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [storedLikedWallpapers, setLikedWallpapers] = useStoredState<LikedWallpaper[]>('ott-liked-wallpapers', []);
  const [editMode, setEditMode] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const likedWallpapers = Array.isArray(storedLikedWallpapers) ? storedLikedWallpapers : [];
  const normalizedTweaks = React.useMemo(() => normalizeTweaks(tweaks), [tweaks]);

  React.useEffect(() => {
    if (normalizedTweaks !== tweaks) setTweaks(normalizedTweaks);
  }, [normalizedTweaks, setTweaks, tweaks]);

  const activeTweaks = normalizedTweaks;
  const setTweak = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => setTweaks((prev) => normalizeTweaks({ ...prev, [key]: value }));
  const setGridLayout = (next: Tweaks['gridLayout']) => setTweak('gridLayout', next);

  const wallpapers = React.useMemo<RenderedWallpaper[]>(() => WALLPAPER_BANK.map((wp) => ({ ...wp, ...renderWallpaper(wp) })), []);
  const generatedWallpaper = wallpapers.find((w) => w.id === activeTweaks.wallpaperId) || wallpapers[0];
  const background = settings.background;
  const showToast = React.useCallback((message: string, tone: Toast['tone'] = 'error') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4200);
  }, []);
  const showErrorToast = React.useCallback((message: string) => showToast(message, 'error'), [showToast]);

  const unsplash = useUnsplashWallpapers(settings, background.type === 'unsplash', showErrorToast);
  const isUnsplashBackground = background.type === 'unsplash';
  const customImageWallpaper = React.useMemo<RenderedWallpaper | null>(() => {
    if (background.type !== 'image' || !background.imageUrl) return null;
    const likedImage = likedWallpapers.find((wallpaper) => wallpaper.dataUrl === background.imageUrl);
    return {
      id: likedImage?.id || 'custom-image',
      name: likedImage?.name || 'Custom image',
      photographer: 'Pinned wallpaper',
      location: 'Local background',
      kind: 'dark',
      paint: () => {},
      dataUrl: background.imageUrl,
      luminance: likedImage?.luminance ?? generatedWallpaper.luminance,
    };
  }, [background.imageUrl, background.type, generatedWallpaper.luminance, likedWallpapers]);

  const activeWallpaper = isUnsplashBackground && unsplash.activeWallpaper ? unsplash.activeWallpaper : customImageWallpaper || generatedWallpaper;
  const effectiveImageUrl = customImageWallpaper?.dataUrl || activeWallpaper.dataUrl;
  const theme = activeWallpaper.luminance > 150 ? 'light' : 'dark';
  const isGrid = activeTweaks.layout === 'grid';
  const liked = likedWallpapers.some((wallpaper) => wallpaper.id === activeWallpaper.id);
  const showWidgets = getVisibleWidgets(activeTweaks, settings);
  const stageStyle = {
    '--accent': activeTweaks.accent,
    '--blur': `${activeTweaks.glassBlur}px`,
    '--sat': `${activeTweaks.glassSat}%`,
    '--bg-dim': `${background.dim / 100}`,
  } as React.CSSProperties;

  const toggleLike = () => {
    setLikedWallpapers((prev) => (
      prev.some((wallpaper) => wallpaper.id === activeWallpaper.id)
        ? prev.filter((wallpaper) => wallpaper.id !== activeWallpaper.id)
        : [...prev, { id: activeWallpaper.id, name: activeWallpaper.name, dataUrl: activeWallpaper.dataUrl, luminance: activeWallpaper.luminance }]
    ));
  };

  const nextWallpaper = () => {
    if (isUnsplashBackground && unsplash.cache.items.length > 0) {
      unsplash.nextWallpaper();
      return;
    }
    const idx = wallpapers.findIndex((wallpaper) => wallpaper.id === generatedWallpaper.id);
    if (background.type !== 'generated') {
      setSettings((prev) => ({ ...prev, background: { ...prev.background, type: 'generated' } }));
    }
    setTweak('wallpaperId', wallpapers[(idx + 1) % wallpapers.length].id);
  };

  const useLikedWallpaper = (wallpaper: LikedWallpaper) => {
    setTweak('wallpaperId', wallpaper.id);
    setSettings((prev) => ({
      ...prev,
      wallpaperRotateMinutes: 0,
      background: { ...prev.background, type: 'image', imageUrl: wallpaper.dataUrl },
    }));
    setSettingsOpen(false);
  };

  const importLikedWallpapers = React.useCallback((incoming: LikedWallpaper[]) => {
    const normalized = incoming.filter(isLikedWallpaper);
    if (!normalized.length) {
      showToast('No liked wallpapers found in that file.', 'error');
      return;
    }
    let added = 0;
    const seen = new Set(likedWallpapers.map(wallpaperHash));
    const next = [...likedWallpapers];
    normalized.forEach((wallpaper) => {
      const hash = wallpaperHash(wallpaper);
      if (seen.has(hash)) return;
      seen.add(hash);
      next.push(wallpaper);
      added += 1;
    });
    setLikedWallpapers(next);
    showToast(added ? `Imported ${added} liked wallpaper${added === 1 ? '' : 's'}.` : 'All imported wallpapers were already liked.', 'success');
  }, [likedWallpapers, setLikedWallpapers, showToast]);

  return (
    <div className={`stage layout--${activeTweaks.layout} ${editMode && isGrid ? 'is-editing' : ''}`} data-theme={theme} style={stageStyle}>
      <StageBackground background={background} imageUrl={effectiveImageUrl} />
      <div className="stage__vignette" />

      {editMode && isGrid && <EditToolbar onReset={setGridLayout} onDone={() => setEditMode(false)} />}

      <div className="stage__content">
        {(!isGrid || !editMode) && (
          <Topbar
            showClock={showWidgets.clock && activeTweaks.layout === 'floating' && activeTweaks.clockStyle !== 'hero'}
            clockStyle={activeTweaks.clockStyle}
          />
        )}
        <WidgetStage
          editMode={editMode}
          isGrid={isGrid}
          onGridLayoutChange={setGridLayout}
          settings={settings}
          showWidgets={showWidgets}
          tweaks={activeTweaks}
          onError={showErrorToast}
        />
        {!editMode && (
          <div className="pos-wp-credit">
            <WallpaperCredit
              key={`${background.type}:${activeWallpaper.id}`}
              wp={activeWallpaper}
              liked={liked}
              onToggleLike={toggleLike}
              onNext={nextWallpaper}
              onPrev={isUnsplashBackground ? unsplash.previousWallpaper : undefined}
              onRefresh={isUnsplashBackground ? unsplash.refresh : undefined}
              refreshDisabled={unsplash.loading || !settings.unsplashApiKey.trim()}
              refreshLoading={unsplash.loading}
              remaining={isUnsplashBackground ? unsplash.cache.remaining : undefined}
              limit={isUnsplashBackground ? unsplash.cache.limit : undefined}
              cachePosition={isUnsplashBackground && unsplash.cache.items.length ? `${unsplash.cache.activeIndex + 1}/${unsplash.cache.items.length}` : undefined}
              status={unsplash.error || (isUnsplashBackground && !settings.unsplashApiKey.trim() ? 'Add Unsplash key' : undefined)}
            />
          </div>
        )}
      </div>

      {isGrid && !editMode && <button className="edit-fab" onClick={() => setEditMode(true)}>Edit layout</button>}
      <button className="gear-fab" data-hidden={settingsOpen ? '1' : '0'} onClick={() => setSettingsOpen(true)} aria-label="Open settings">⚙</button>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        likedWallpapers={likedWallpapers}
        onUnlike={(id) => setLikedWallpapers((prev) => prev.filter((wallpaper) => wallpaper.id !== id))}
        onUseLiked={useLikedWallpaper}
        tweaks={activeTweaks}
        onTweakChange={setTweak}
        wallpaperBank={WALLPAPER_BANK}
        onClearUnsplashCache={unsplash.clearCache}
        onExportLiked={() => exportLikedWallpapers(likedWallpapers, showToast)}
        onImportLiked={importLikedWallpapers}
        onNotify={showToast}
      />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </div>
  );
}

function getVisibleWidgets(tweaks: Tweaks, settings: Settings): Record<WidgetId, boolean> {
  return {
    search: tweaks.showSearch && settings.showWidgets.search,
    clock: tweaks.showClock && settings.showWidgets.clock,
    weather: tweaks.showWeather && settings.showWidgets.weather,
    calendar: tweaks.showCalendar && settings.showWidgets.calendar,
    notes: tweaks.showNotes && settings.showWidgets.notes,
    mostVisited: tweaks.showMostVisited && settings.showWidgets.mostVisited,
  };
}

function isLikedWallpaper(value: unknown): value is LikedWallpaper {
  if (!value || typeof value !== 'object') return false;
  const wallpaper = value as LikedWallpaper;
  return typeof wallpaper.id === 'string' && typeof wallpaper.name === 'string' && typeof wallpaper.dataUrl === 'string';
}

function wallpaperHash(wallpaper: LikedWallpaper) {
  let hash = 5381;
  const source = `${wallpaper.id}|${wallpaper.name}|${wallpaper.dataUrl}`;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) + hash) ^ source.charCodeAt(i);
  }
  return String(hash >>> 0);
}

function exportLikedWallpapers(likedWallpapers: LikedWallpaper[], notify: (message: string, tone?: Toast['tone']) => void) {
  try {
    const payload = JSON.stringify({ app: 'OnTrackTab', version: 1, exportedAt: new Date().toISOString(), likedWallpapers }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ontracktab-liked-wallpapers.json';
    anchor.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${likedWallpapers.length} liked wallpaper${likedWallpapers.length === 1 ? '' : 's'}.`, 'success');
  } catch {
    notify('Could not export liked wallpapers.', 'error');
  }
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button key={toast.id} className="toast" data-tone={toast.tone} onClick={() => onDismiss(toast.id)}>
          {toast.message}
        </button>
      ))}
    </div>
  );
}
