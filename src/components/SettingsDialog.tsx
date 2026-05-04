import React from 'react';
import { CalendarDays, Cloud, Grid2X2, Image, Info, KeyRound, Search, SlidersHorizontal, Trash2, Video } from 'lucide-react';
import type { BackgroundSettings, LikedWallpaper, Settings, Tweaks, Wallpaper, WidgetId } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  tomorrowApiKey: '',
  unsplashApiKey: '',
  unsplashCacheSize: 25,
  unsplashQuery: 'nature, landscape, architecture',
  weatherLocations: ['San Francisco, CA', 'Tokyo, JP', 'Reykjavik, IS'],
  holidays: '01-01:New Year, 04-27:Family Day, 05-26:Memorial Day, 07-04:Independence Day, 12-25:Christmas',
  wallpaperRotateMinutes: 30,
  showWidgets: { search: true, clock: true, weather: true, calendar: true, notes: true, mostVisited: true },
  searchEngine: 'Google',
  startWeekOn: 'Sunday',
  tempUnit: 'C',
  background: { type: 'generated', imageUrl: '', videoUrl: '', dim: 18, muted: true },
};

const widgetLabels: Record<WidgetId, string> = {
  search: 'Search',
  clock: 'Clock',
  weather: 'Weather',
  calendar: 'Calendar',
  notes: 'Notes',
  mostVisited: 'Most visited',
};

export function SettingsDialog({
  open,
  onClose,
  settings,
  onChange,
  likedWallpapers,
  onUnlike,
  onUseLiked,
  tweaks,
  onTweakChange,
  wallpaperBank,
  onClearUnsplashCache,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (settings: Settings) => void;
  likedWallpapers: LikedWallpaper[];
  onUnlike: (id: string) => void;
  onUseLiked: (wp: LikedWallpaper) => void;
  tweaks: Tweaks;
  onTweakChange: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
  wallpaperBank: Wallpaper[];
  onClearUnsplashCache: () => void;
}) {
  const [section, setSection] = React.useState('widgets');
  const [newLoc, setNewLoc] = React.useState('');

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const setBackground = (patch: Partial<BackgroundSettings>) => set({ background: { ...settings.background, ...patch } });
  const setWidget = (k: WidgetId, v: boolean) => set({ showWidgets: { ...settings.showWidgets, [k]: v } });
  const addLocation = () => {
    if (!newLoc.trim()) return;
    set({ weatherLocations: [...settings.weatherLocations, newLoc.trim()] });
    setNewLoc('');
  };

  const sections = [
    { id: 'widgets', label: 'Widgets', icon: Grid2X2 },
    { id: 'tweaks', label: 'Tweaks', icon: SlidersHorizontal },
    { id: 'background', label: 'Background', icon: Video },
    { id: 'wallpaper', label: 'Wallpaper', icon: Image },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'api', label: 'API Keys', icon: KeyRound },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__head">
          <div className="modal__title"><SlidersHorizontal size={16} />Settings</div>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal__body">
          <nav className="modal__nav">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`modal__nav-item ${section === id ? 'is-active' : ''}`} onClick={() => setSection(id)}>
                <Icon size={14} />
                {label}
              </button>
            ))}
            <div className="modal__nav-spacer" />
            <div className="modal__nav-foot">v0.4.2 · local</div>
          </nav>

          <div className="modal__content">
            {section === 'widgets' && (
              <div className="settings__section">
                <div className="settings__group-title">Visible widgets</div>
                <div className="settings__group-help">Toggle which widgets appear on the new tab.</div>
                {(Object.keys(widgetLabels) as WidgetId[]).map((k) => (
                  <Row key={k} label={widgetLabels[k]} desc={widgetDesc(k)}>
                    <Toggle value={settings.showWidgets[k]} onChange={(v) => setWidget(k, v)} />
                  </Row>
                ))}
              </div>
            )}

            {section === 'tweaks' && (
              <div className="settings__section">
                <div className="settings__group-title">Appearance</div>
                <Row label="Layout"><Segmented value={tweaks.layout} options={['grid', 'floating', 'bento']} onChange={(v) => onTweakChange('layout', v as Tweaks['layout'])} /></Row>
                <Row label="Clock style"><Segmented value={tweaks.clockStyle} options={['minimal', 'hero', 'compact']} onChange={(v) => onTweakChange('clockStyle', v as Tweaks['clockStyle'])} /></Row>
                <Row label="Glass blur" desc={`${tweaks.glassBlur}px`}>
                  <input className="settings__range" type="range" min={0} max={60} value={tweaks.glassBlur} onChange={(e) => onTweakChange('glassBlur', Number(e.target.value))} />
                </Row>
                <Row label="Glass saturation" desc={`${tweaks.glassSat}%`}>
                  <input className="settings__range" type="range" min={100} max={260} value={tweaks.glassSat} onChange={(e) => onTweakChange('glassSat', Number(e.target.value))} />
                </Row>
                <Row label="Accent"><input className="settings__color" type="color" value={tweaks.accent} onChange={(e) => onTweakChange('accent', e.target.value)} /></Row>
              </div>
            )}

            {section === 'background' && (
              <div className="settings__section">
                <div className="settings__group-title">Background source</div>
                <Row label="Source"><Segmented value={settings.background.type} options={['generated', 'unsplash', 'image', 'video']} onChange={(v) => setBackground({ type: v as BackgroundSettings['type'] })} /></Row>
                {settings.background.type === 'generated' && (
                  <Row label="Generated sample" desc="Uses the built-in painted wallpaper bank">
                    <Select value={tweaks.wallpaperId} options={wallpaperBank.map((w) => ({ value: w.id, label: w.name }))} onChange={(v) => onTweakChange('wallpaperId', v)} />
                  </Row>
                )}
                {settings.background.type === 'unsplash' && (
                  <>
                    <div className="settings__group-help">Uses your Unsplash Access Key and keeps fetched images in extension storage so reloads do not request the same image again.</div>
                    <Row label="Query" desc="Comma-separated topics">
                      <input className="settings__input settings__input--compact" placeholder="nature, landscape, architecture" value={settings.unsplashQuery} onChange={(e) => set({ unsplashQuery: e.target.value })} />
                    </Row>
                    <Row label="Cache size" desc={`${settings.unsplashCacheSize} images`}>
                      <div className="settings__inline-control">
                        <input className="settings__range" type="range" min={5} max={25} value={settings.unsplashCacheSize} onChange={(e) => set({ unsplashCacheSize: Number(e.target.value) })} />
                        <button className="settings__icon-btn" onClick={onClearUnsplashCache} aria-label="Clear cached Unsplash images"><Trash2 size={14} /></button>
                      </div>
                    </Row>
                  </>
                )}
                {settings.background.type === 'image' && (
                  <div className="settings__media-fields">
                    <div className="settings__group-help">Paste an extension-safe image URL or a data URL. Local file upload can be added behind Chrome storage later.</div>
                    <input className="settings__input" placeholder="https://example.com/background.jpg" value={settings.background.imageUrl} onChange={(e) => setBackground({ imageUrl: e.target.value })} />
                  </div>
                )}
                {settings.background.type === 'video' && (
                  <div className="settings__media-fields">
                    <div className="settings__group-help">Use a muted looping MP4/WebM URL for motion backgrounds.</div>
                    <input className="settings__input" placeholder="https://example.com/background.webm" value={settings.background.videoUrl} onChange={(e) => setBackground({ videoUrl: e.target.value })} />
                    <Row label="Muted"><Toggle value={settings.background.muted} onChange={(v) => setBackground({ muted: v })} /></Row>
                  </div>
                )}
                <Row label="Overlay dim" desc={`${settings.background.dim}%`}>
                  <input className="settings__range" type="range" min={0} max={55} value={settings.background.dim} onChange={(e) => setBackground({ dim: Number(e.target.value) })} />
                </Row>
              </div>
            )}

            {section === 'wallpaper' && (
              <div className="settings__section">
                <div className="settings__group-title">Rotation</div>
                <Row label="Auto-rotate" desc="Cycle through generated wallpapers"><Toggle value={settings.wallpaperRotateMinutes > 0} onChange={(v) => set({ wallpaperRotateMinutes: v ? 30 : 0 })} /></Row>
                <Row label="Rotate every">
                  <Select value={String(settings.wallpaperRotateMinutes)} options={['0:Never', '5:5 min', '15:15 min', '30:30 min', '60:1 hour', '360:6 hours', '1440:Daily'].map((x) => { const [value, label] = x.split(':'); return { value, label }; })} onChange={(v) => set({ wallpaperRotateMinutes: Number(v) })} />
                </Row>
                <div className="settings__group-title" style={{ marginTop: 28 }}>Liked wallpapers</div>
                {likedWallpapers.length === 0 ? <div className="settings__empty">Tap the heart icon under any wallpaper to save it here.</div> : <div className="settings__wp-grid">{likedWallpapers.map((wp) => <div key={wp.id} className="settings__wp"><button className="settings__wp-thumb" style={{ backgroundImage: `url(${wp.dataUrl})` }} onClick={() => onUseLiked(wp)}><span className="settings__wp-pin">Pin</span></button><div className="settings__wp-name">{wp.name}</div><button className="settings__wp-x" onClick={() => onUnlike(wp.id)} aria-label="Remove">×</button></div>)}</div>}
              </div>
            )}

            {section === 'weather' && (
              <div className="settings__section">
                <div className="settings__group-title">Locations</div>
                <div className="settings__chip-list">{settings.weatherLocations.map((loc, i) => <div key={`${loc}-${i}`} className="settings__chip">{loc}<button onClick={() => set({ weatherLocations: settings.weatherLocations.filter((_, j) => j !== i) })}>×</button></div>)}</div>
                <div className="settings__add-row"><input className="settings__input" placeholder="Add location, e.g. Berlin, DE" value={newLoc} onChange={(e) => setNewLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addLocation(); }} /><button className="settings__btn" onClick={addLocation}>Add</button></div>
                <div className="settings__group-title" style={{ marginTop: 24 }}>Units</div>
                <Row label="Temperature"><Segmented value={settings.tempUnit} options={['C', 'F']} onChange={(v) => set({ tempUnit: v as Settings['tempUnit'] })} /></Row>
              </div>
            )}

            {section === 'calendar' && (
              <div className="settings__section">
                <div className="settings__group-title">Holidays</div>
                <div className="settings__group-help">Comma-separated <code>MM-DD:Label</code> pairs.</div>
                <textarea className="settings__textarea" rows={4} value={settings.holidays} onChange={(e) => set({ holidays: e.target.value })} />
                <Row label="Start week on"><Segmented value={settings.startWeekOn} options={['Sunday', 'Monday']} onChange={(v) => set({ startWeekOn: v as Settings['startWeekOn'] })} /></Row>
              </div>
            )}

            {section === 'search' && <div className="settings__section"><div className="settings__group-title">Default engine</div><Row label="Search engine"><Select value={settings.searchEngine} options={['Google', 'DuckDuckGo', 'Bing', 'Kagi'].map((v) => ({ value: v, label: v }))} onChange={(v) => set({ searchEngine: v })} /></Row><Row label="Keyboard shortcut"><kbd className="settings__kbd">/</kbd></Row></div>}
            {section === 'api' && <div className="settings__section"><div className="settings__group-title">Tomorrow.io</div><div className="settings__group-help">Paste your Tomorrow.io API key to enable live weather data.</div><input className="settings__input settings__input--mono" placeholder="Tomorrow.io API key" value={settings.tomorrowApiKey} type="password" onChange={(e) => set({ tomorrowApiKey: e.target.value })} /><div className="settings__keyhint"><Info size={13} /> Create a free Tomorrow.io account, open the Weather API dashboard, then copy the default API key from the API Keys section and paste it here.</div><div className="settings__group-title" style={{ marginTop: 24 }}>Unsplash</div><div className="settings__group-help">Paste the Unsplash <b>Access Key</b>. The Secret Key is not needed for public wallpaper photos.</div><input className="settings__input settings__input--mono" placeholder="Unsplash Access Key / Client ID" value={settings.unsplashApiKey} type="password" onChange={(e) => set({ unsplashApiKey: e.target.value })} /><div className="settings__keyhint"><Info size={13} /> Create an Unsplash developer app, open its Keys section, copy the Access Key, then paste it here. Use the Background tab to select Unsplash.</div><div className="settings__keyhint">Keys and cached wallpapers are stored locally by the extension.</div></div>}
            {section === 'about' && <div className="settings__section"><div className="settings__about"><div className="settings__about-mark">OT</div><div className="settings__about-name">OnTrackTab</div><div className="settings__about-ver">Version 0.4.2 · April 2026</div><div className="settings__about-desc">A calmer new tab. Local-first, glass-light.</div></div></div>}
          </div>
        </div>

        <div className="modal__foot"><span className="modal__foot-hint">⌘, to open · esc to close</span><button className="settings__btn settings__btn--primary" onClick={onClose}>Done</button></div>
      </div>
    </div>
  );
}

function widgetDesc(k: WidgetId) {
  return {
    search: 'Bookmarks-first with Google fallback',
    clock: 'Time and date in the top hero area',
    weather: 'Current conditions for saved locations',
    calendar: 'Month grid with holidays and weekends',
    notes: 'Local markdown notes and todos',
    mostVisited: 'Top sites from browsing history',
  }[k];
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return <div className="settings__row"><div className="settings__row-text"><div className="settings__row-label">{label}</div>{desc && <div className="settings__row-desc">{desc}</div>}</div><div className="settings__row-control">{children}</div></div>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button className="ui-toggle" data-on={value ? '1' : '0'} onClick={() => onChange(!value)}><i /></button>;
}

function Select({ value, options, onChange }: { value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }) {
  return <select className="ui-select" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

function Segmented({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return <div className="ui-seg">{options.map((o) => <button key={o} className={`ui-seg__btn ${value === o ? 'is-active' : ''}`} onClick={() => onChange(o)}>{o}</button>)}</div>;
}
