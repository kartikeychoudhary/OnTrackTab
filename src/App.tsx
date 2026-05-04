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

export default function App() {
  const [tweaks, setTweaks] = useStoredState<Tweaks>('ott-tweaks', TWEAK_DEFAULTS);
  const [settings, setSettings] = useStoredState<Settings>('ott-settings', DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [storedLikedWallpapers, setLikedWallpapers] = useStoredState<LikedWallpaper[]>('ott-liked-wallpapers', []);
  const [editMode, setEditMode] = React.useState(false);

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
  const unsplash = useUnsplashWallpapers(settings, background.type === 'unsplash');
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
      />
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
