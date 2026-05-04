import React from 'react';
import type { CachedUnsplashWallpaper, LikedWallpaper, RenderedWallpaper } from '../types';

const pad2 = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ClockWidget({ style = 'minimal' }: { style?: 'minimal' | 'hero' | 'compact' }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const h = now.getHours();
  const m = now.getMinutes();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const dateLine = `${dayName}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  if (style === 'hero') {
    return <div className="clock clock--hero"><div className="clock__time clock__time--hero">{pad2(h)}<span className="clock__colon">:</span>{pad2(m)}</div><div className="clock__date">{dateLine}</div></div>;
  }
  if (style === 'compact') {
    return <div className="clock clock--compact"><div className="clock__time">{pad2(h)}:{pad2(m)}</div><div className="clock__date clock__date--small">{MONTHS[now.getMonth()].slice(0, 3)} {now.getDate()}</div></div>;
  }
  return <div className="clock clock--minimal"><span className="clock__time">{pad2(h)}:{pad2(m)}</span><span className="clock__sep">·</span><span className="clock__date">{dateLine}</span></div>;
}

const SAMPLE_BOOKMARKS = [
  { title: 'GitHub - Pull Requests', url: 'github.com/pulls', folder: 'Work', favicon: '#0d1117' },
  { title: 'Linear - Q2 Sprint', url: 'linear.app/team/sprint', folder: 'Work', favicon: '#5e6ad2' },
  { title: 'Figma - OnTrackTab v3', url: 'figma.com/file/ontrack', folder: 'Design', favicon: '#a259ff' },
  { title: 'Hacker News', url: 'news.ycombinator.com', folder: 'Reading', favicon: '#ff6600' },
  { title: 'Notion - Personal', url: 'notion.so/personal', folder: 'Notes', favicon: '#000000' },
  { title: 'YouTube - Watch Later', url: 'youtube.com/playlist?list=WL', folder: 'Media', favicon: '#ff0000' },
];

interface BookmarkMatch {
  title: string;
  url: string;
  folder: string;
  favicon: string;
}

interface SiteVisit {
  title: string;
  url: string;
  color: string;
  visits: string;
}

function chromeApi() {
  return window.chrome;
}

function normalizedHost(url: string) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

function openUrl(url: string) {
  const href = url.startsWith('http') ? url : `https://${url}`;
  window.location.href = href;
}

function colorFromText(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 58% 38%)`;
}

function displayTitle(title: string | undefined, url: string) {
  return title?.trim() || normalizedHost(url);
}

function getBookmarkFolder(parentId?: string) {
  return new Promise<string>((resolve) => {
    if (!parentId || !chromeApi()?.bookmarks?.get) {
      resolve('Bookmarks');
      return;
    }
    chromeApi()?.bookmarks?.get(parentId, (nodes) => {
      if (chromeApi()?.runtime?.lastError) {
        resolve('Bookmarks');
        return;
      }
      resolve(nodes[0]?.title || 'Bookmarks');
    });
  });
}

async function searchChromeBookmarks(query: string): Promise<BookmarkMatch[]> {
  const bookmarks = chromeApi()?.bookmarks;
  if (!bookmarks?.search) {
    return SAMPLE_BOOKMARKS.filter((b) => {
      const needle = query.toLowerCase();
      return b.title.toLowerCase().includes(needle) || b.url.toLowerCase().includes(needle);
    });
  }
  return new Promise((resolve) => {
    bookmarks.search(query, async (nodes) => {
      if (chromeApi()?.runtime?.lastError) {
        resolve([]);
        return;
      }
      const urlNodes = nodes.filter((node) => node.url).slice(0, 8);
      const matches = await Promise.all(urlNodes.map(async (node) => ({
        title: displayTitle(node.title, node.url || ''),
        url: node.url || '',
        folder: await getBookmarkFolder(node.parentId),
        favicon: colorFromText(node.url || node.title || ''),
      })));
      resolve(matches);
    });
  });
}

async function getChromeRecentSites(): Promise<SiteVisit[]> {
  const history = chromeApi()?.history;
  if (history?.search && history?.getVisits) {
    return new Promise((resolve) => {
      const weekStart = Date.now() - 1000 * 60 * 60 * 24 * 7;
      history.search({ text: '', startTime: weekStart, maxResults: 100 }, async (results) => {
        if (chromeApi()?.runtime?.lastError) {
          resolve([]);
          return;
        }
        const byUrl = new Map<string, { title: string; url: string; lastVisitTime: number; weeklyVisits: number }>();
        results.filter((site) => site.url).forEach((site) => {
          const url = site.url || '';
          const prev = byUrl.get(url);
          const lastVisitTime = site.lastVisitTime || 0;
          if (!prev || lastVisitTime > prev.lastVisitTime) {
            byUrl.set(url, { title: displayTitle(site.title, url), url, lastVisitTime, weeklyVisits: 0 });
          }
        });

        const counted = await Promise.all(Array.from(byUrl.values()).map((site) => new Promise<typeof site>((done) => {
          history.getVisits({ url: site.url }, (visits) => {
            const weeklyVisits = chromeApi()?.runtime?.lastError
              ? 0
              : visits.filter((visit) => (visit.visitTime || 0) >= weekStart).length;
            done({ ...site, weeklyVisits });
          });
        })));

        resolve(counted
          .filter((site) => site.weeklyVisits > 0)
          .sort((a, b) => b.weeklyVisits - a.weeklyVisits || b.lastVisitTime - a.lastVisitTime)
          .slice(0, 6)
          .map((site) => ({
            title: site.title,
            url: site.url,
            color: colorFromText(site.url || site.title),
            visits: `${site.weeklyVisits}x`,
          })));
      });
    });
  }

  const topSites = chromeApi()?.topSites;
  if (topSites?.get) {
    return new Promise((resolve) => {
      topSites.get((results) => {
        if (chromeApi()?.runtime?.lastError) {
          resolve([]);
          return;
        }
        resolve(results.slice(0, 6).map((site) => ({
          title: displayTitle(site.title, site.url),
          url: site.url,
          color: colorFromText(site.url),
          visits: 'top',
        })));
      });
    });
  }

  return MOST_VISITED;
}

export function SearchWidget() {
  const [mode, setMode] = React.useState<'bookmarks' | 'google'>('bookmarks');
  const [q, setQ] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [matches, setMatches] = React.useState<BookmarkMatch[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    if (mode !== 'bookmarks' || !q.trim()) {
      setMatches([]);
      setLoadingBookmarks(false);
      return () => { cancelled = true; };
    }
    setLoadingBookmarks(true);
    const id = window.setTimeout(() => {
      searchChromeBookmarks(q.trim()).then((next) => {
        if (cancelled) return;
        setMatches(next.slice(0, 5));
        setLoadingBookmarks(false);
      });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [mode, q]);

  const runSearch = () => {
    const term = q.trim();
    if (!term) return;
    if (mode === 'bookmarks' && matches[0]) {
      openUrl(matches[0].url);
      return;
    }
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
  };

  return (
    <div className="glass glass--lg search">
      <div className="search__tabs" role="tablist">
        {(['bookmarks', 'google'] as const).map((tab) => (
          <button key={tab} role="tab" aria-selected={mode === tab} className={`search__tab ${mode === tab ? 'is-active' : ''}`} onClick={() => setMode(tab)}>
            {tab === 'bookmarks' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
            )}
            {tab === 'bookmarks' ? 'Bookmarks' : 'Google'}
          </button>
        ))}
        <span className="search__shortcut">press /</span>
      </div>
      <div className="search__field">
        <svg className="search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
        <input ref={inputRef} className="search__input" placeholder={mode === 'bookmarks' ? 'Search Chrome bookmarks, fall through to Google...' : 'Search Google...'} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        {q && <button className="search__clear" onClick={() => setQ('')} aria-label="Clear"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg></button>}
      </div>
      {focused && q.trim() && (
        <div className="search__results">
          {mode === 'bookmarks' && loadingBookmarks && <div className="search__empty">Searching Chrome bookmarks...</div>}
          {mode === 'bookmarks' && !loadingBookmarks && matches.length > 0 && <div className="search__group"><div className="search__group-label">Chrome bookmarks · {matches.length}</div>{matches.map((b) => <a key={b.url} className="search__result" href={b.url} onClick={(e) => { e.preventDefault(); openUrl(b.url); }}><span className="search__favicon" style={{ background: b.favicon }}>{b.title[0]}</span><span className="search__result-text"><span className="search__result-title">{b.title}</span><span className="search__result-url">{normalizedHost(b.url)}</span></span><span className="search__result-folder">{b.folder}</span></a>)}</div>}
          {mode === 'bookmarks' && !loadingBookmarks && matches.length === 0 && <div className="search__empty">No Chrome bookmarks match — press <kbd>↵</kbd> to search Google instead</div>}
          <button className="search__fallback" onMouseDown={(e) => e.preventDefault()} onClick={runSearch}><span className="search__fallback-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>Search Google for "<b>{q}</b>"</button>
        </div>
      )}
    </div>
  );
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  cond: string;
  icon: string;
  humidity: number;
  wind: number;
  fetchedAt?: number;
  source: 'demo' | 'api' | 'cache';
}

const WEATHER_CACHE_TTL = 30 * 60 * 1000;

const WEATHER_DATA: Record<string, WeatherData> = {
  'San Francisco, CA': { temp: 16, feelsLike: 16, cond: 'Partly Cloudy', icon: 'cloud-sun', humidity: 72, wind: 12, source: 'demo' },
  'Tokyo, JP': { temp: 22, feelsLike: 23, cond: 'Clear', icon: 'sun', humidity: 58, wind: 8, source: 'demo' },
  'Reykjavik, IS': { temp: 4, feelsLike: 1, cond: 'Light Snow', icon: 'snow', humidity: 82, wind: 24, source: 'demo' },
  'Bangalore, IN': { temp: 28, feelsLike: 31, cond: 'Rain', icon: 'rain', humidity: 88, wind: 6, source: 'demo' },
};

function weatherCacheKey(location: string, tempUnit: 'C' | 'F') {
  return `ott-weather:${tempUnit}:${location.trim().toLowerCase()}`;
}

function readCachedWeather(location: string, tempUnit: 'C' | 'F') {
  try {
    const raw = localStorage.getItem(weatherCacheKey(location, tempUnit));
    if (!raw) return null;
    const cached = JSON.parse(raw) as WeatherData;
    if (!cached.fetchedAt) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedWeather(location: string, tempUnit: 'C' | 'F', data: WeatherData) {
  try {
    localStorage.setItem(weatherCacheKey(location, tempUnit), JSON.stringify(data));
  } catch {}
}

function weatherCodeLabel(code?: number) {
  if (code == null) return { cond: 'Current', icon: 'cloud' };
  if ([1000, 1100].includes(code)) return { cond: 'Clear', icon: 'sun' };
  if ([1101, 1102, 1001].includes(code)) return { cond: 'Cloudy', icon: 'cloud-sun' };
  if ([4000, 4001, 4200, 4201].includes(code)) return { cond: 'Rain', icon: 'rain' };
  if ([5000, 5001, 5100, 5101].includes(code)) return { cond: 'Snow', icon: 'snow' };
  if ([2000, 2100].includes(code)) return { cond: 'Fog', icon: 'cloud' };
  if ([8000].includes(code)) return { cond: 'Thunderstorm', icon: 'rain' };
  return { cond: 'Current', icon: 'cloud' };
}

async function fetchTomorrowWeather(location: string, apiKey: string, tempUnit: 'C' | 'F'): Promise<WeatherData> {
  const units = tempUnit === 'F' ? 'imperial' : 'metric';
  const url = new URL('https://api.tomorrow.io/v4/weather/realtime');
  url.searchParams.set('location', location);
  url.searchParams.set('units', units);
  url.searchParams.set('apikey', apiKey);
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Tomorrow.io returned ${res.status}`);
  const json = await res.json() as { data?: { values?: Record<string, number> } };
  const values = json.data?.values || {};
  const code = weatherCodeLabel(values.weatherCode);
  return {
    temp: Math.round(values.temperature ?? 0),
    feelsLike: Math.round(values.temperatureApparent ?? values.temperature ?? 0),
    cond: code.cond,
    icon: code.icon,
    humidity: Math.round(values.humidity ?? 0),
    wind: Math.round(values.windSpeed ?? 0),
    fetchedAt: Date.now(),
    source: 'api',
  };
}

function WeatherIcon({ kind, size = 28 }: { kind: string; size?: number }) {
  const s = { width: size, height: size };
  if (kind === 'sun') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>;
  if (kind === 'rain') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 14h10a4 4 0 0 0 .6-7.95 5.5 5.5 0 0 0-10.7-1A4 4 0 0 0 7 14z" fill="currentColor" fillOpacity="0.25" /><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" /></svg>;
  if (kind === 'snow') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 14h10a4 4 0 0 0 .6-7.95 5.5 5.5 0 0 0-10.7-1A4 4 0 0 0 7 14z" fill="currentColor" fillOpacity="0.25" /><path d="M9 19l.5.5M13 18l.5.5M17 19l.5.5M9 21l-.5-.5M13 20l-.5-.5M17 21l-.5-.5" /></svg>;
  return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 18h10a4 4 0 0 0 .6-7.95 5.5 5.5 0 0 0-10.7-1A4 4 0 0 0 7 18z" fill="currentColor" fillOpacity="0.25" />{kind === 'cloud-sun' && <circle cx="8" cy="8" r="3" fill="currentColor" fillOpacity="0.18" />}</svg>;
}

export function WeatherWidget({ locations, apiKey, tempUnit }: { locations: string[]; apiKey: string; tempUnit: 'C' | 'F' }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const list = locations.length ? locations : ['San Francisco, CA'];
  const safeIdx = Math.min(activeIdx, list.length - 1);
  const loc = list[safeIdx];
  const fallback = WEATHER_DATA[loc] || WEATHER_DATA['San Francisco, CA'];
  const [data, setData] = React.useState<WeatherData>(() => readCachedWeather(loc, tempUnit) || fallback);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadWeather = React.useCallback(async (force = false) => {
    const key = apiKey.trim();
    const cached = readCachedWeather(loc, tempUnit);
    if (!force && cached && Date.now() - cached.fetchedAt! < WEATHER_CACHE_TTL) {
      setData({ ...cached, source: 'cache' });
      setError('');
      return;
    }
    if (!key) {
      setData(cached || fallback);
      setError('');
      return;
    }
    setLoading(true);
    try {
      const next = await fetchTomorrowWeather(loc, key, tempUnit);
      writeCachedWeather(loc, tempUnit, next);
      setData(next);
      setError('');
    } catch {
      setData(cached ? { ...cached, source: 'cache' } : fallback);
      setError(cached ? 'Using cached weather' : 'Weather unavailable');
    } finally {
      setLoading(false);
    }
  }, [apiKey, fallback, loc, tempUnit]);

  React.useEffect(() => {
    loadWeather(false);
    const id = window.setInterval(() => {
      if (!document.hidden) loadWeather(false);
    }, WEATHER_CACHE_TTL);
    return () => window.clearInterval(id);
  }, [loadWeather]);

  const updated = data.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'demo';
  const windUnit = tempUnit === 'F' ? 'mph' : 'km/h';

  return (
    <div className="glass glass--lg weather">
      <div className="weather__head">
        <div>
          <div className="weather__loc"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{loc}</div>
          <div className="weather__cond">{error || data.cond} · {data.source === 'api' ? `updated ${updated}` : data.source === 'cache' ? `cached ${updated}` : 'demo'}</div>
        </div>
        <button className="weather__refresh" onClick={() => loadWeather(true)} disabled={loading} aria-label="Refresh weather">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9M21 3v6h-6" /></svg>
        </button>
      </div>
      <div className="weather__body"><div className="weather__icon"><WeatherIcon kind={data.icon} size={56} /></div><div className="weather__temp">{data.temp}<span className="weather__temp-unit">°{tempUnit}</span></div></div>
      <div className="weather__meta"><div className="weather__meta-item"><span className="weather__meta-label">Feels</span><span className="weather__meta-val">{data.feelsLike}°</span></div><div className="weather__meta-item"><span className="weather__meta-label">Humidity</span><span className="weather__meta-val">{data.humidity}%</span></div><div className="weather__meta-item"><span className="weather__meta-label">Wind</span><span className="weather__meta-val">{data.wind} {windUnit}</span></div></div>
      {list.length > 1 && <div className="weather__dots">{list.map((l, i) => <button key={l} className={`weather__dot ${i === safeIdx ? 'is-active' : ''}`} aria-label={l} onClick={() => setActiveIdx(i)} />)}</div>}
    </div>
  );
}

function parseHolidays(str: string) {
  const map: Record<string, string> = {};
  str.split(',').forEach((item) => {
    const [date, ...rest] = item.trim().split(':');
    if (date && rest.length) map[date.trim()] = rest.join(':').trim();
  });
  return map;
}

export function CalendarWidget({ holidays }: { holidays: string }) {
  const today = new Date();
  const [view, setView] = React.useState({ y: today.getFullYear(), m: today.getMonth() });
  const holidayMap = React.useMemo(() => parseHolidays(holidays), [holidays]);
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const prevMonthDays = new Date(view.y, view.m, 0).getDate();
  const cells: Array<{ day: number; muted?: boolean; isToday?: boolean; isWeekend?: boolean; holiday?: string }> = [];
  for (let i = 0; i < startDow; i += 1) cells.push({ day: prevMonthDays - startDow + 1 + i, muted: true });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dt = new Date(view.y, view.m, d);
    cells.push({ day: d, isToday: d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear(), isWeekend: [0, 6].includes(dt.getDay()), holiday: holidayMap[`${pad2(view.m + 1)}-${pad2(d)}`] });
  }
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - startDow + 1, muted: true });
  const nav = (delta: number) => setView((v) => ({ y: v.m + delta < 0 ? v.y - 1 : v.m + delta > 11 ? v.y + 1 : v.y, m: (v.m + delta + 12) % 12 }));
  const upcoming = Object.entries(holidayMap).map(([k, label]) => ({ k, label, m: Number(k.slice(0, 2)) - 1, d: Number(k.slice(3, 5)) })).filter((h) => h.m === view.m).sort((a, b) => a.d - b.d);
  return <div className="glass glass--lg calendar"><div className="calendar__head"><div><div className="calendar__month">{MONTHS[view.m]}</div><div className="calendar__year">{view.y}</div></div><div className="calendar__nav"><button onClick={() => nav(-1)} aria-label="Previous month"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg></button><button className="calendar__today-btn" onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}>Today</button><button onClick={() => nav(1)} aria-label="Next month"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg></button></div></div><div className="calendar__grid">{DOW.map((d) => <div key={d} className={`calendar__dow ${d === 'Sat' || d === 'Sun' ? 'calendar__dow--weekend' : ''}`}>{d[0]}</div>)}{cells.map((c, i) => <div key={i} className={['calendar__cell', c.muted && 'calendar__cell--muted', c.isToday && 'calendar__cell--today', c.isWeekend && !c.muted && 'calendar__cell--weekend', c.holiday && 'calendar__cell--holiday'].filter(Boolean).join(' ')} title={c.holiday}><span className="calendar__day">{c.day}</span>{c.holiday && <span className="calendar__pip" />}</div>)}</div>{upcoming.length > 0 && <div className="calendar__holidays">{upcoming.slice(0, 2).map((h) => <div key={h.k} className="calendar__holiday"><span className="calendar__holiday-date">{MONTHS[h.m].slice(0, 3)} {h.d}</span><span className="calendar__holiday-name">{h.label}</span></div>)}</div>}</div>;
}

const DEFAULT_NOTES = `# Today
- [x] Ship the OnTrackTab prototype
- [ ] Review weather widget icons
- [ ] Reply to **Sara** about Q2 plan`;

function renderMarkdown(src: string) {
  return src.split('\n').map((line, idx) => {
    if (line.startsWith('# ')) return <h1 key={idx} className="md-h md-h1">{line.slice(2)}</h1>;
    if (/^[-*]\s+\[( |x|X)\]\s+/.test(line)) {
      const checked = /\[(x|X)\]/.test(line);
      return <div key={idx} className={`md-todo ${checked ? 'is-checked' : ''}`}><span className={`md-check ${checked ? 'is-checked' : ''}`}>{checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="m5 12 5 5L20 7" /></svg>}</span><span>{line.replace(/^[-*]\s+\[( |x|X)\]\s+/, '')}</span></div>;
    }
    if (line.trim() === '') return <div key={idx} className="md-spacer" />;
    return <p key={idx} className="md-p">{line}</p>;
  });
}

export function NotesWidget() {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(() => localStorage.getItem('ott-notes') || DEFAULT_NOTES);
  React.useEffect(() => localStorage.setItem('ott-notes', text), [text]);
  return <div className="glass glass--lg notes"><div className="notes__head"><div className="notes__title"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>Notes</div><button className="notes__toggle" onClick={() => setEditing((e) => !e)}>{editing ? 'Preview' : 'Edit'}</button></div>{editing ? <textarea className="notes__editor" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} autoFocus /> : <div className="notes__preview">{renderMarkdown(text)}</div>}<div className="notes__foot"><span>markdown</span><span>{text.split('\n').length} lines · saved locally</span></div></div>;
}

const MOST_VISITED = [
  { title: 'GitHub', url: 'github.com', color: '#24292e', visits: '2.1k' },
  { title: 'Linear', url: 'linear.app', color: '#5e6ad2', visits: '847' },
  { title: 'Figma', url: 'figma.com', color: '#a259ff', visits: '612' },
  { title: 'Gmail', url: 'mail.google.com', color: '#ea4335', visits: '1.4k' },
  { title: 'Slack', url: 'slack.com', color: '#4a154b', visits: '930' },
  { title: 'Notion', url: 'notion.so', color: '#000000', visits: '425' },
];

export function MostVisitedWidget() {
  const [sites, setSites] = React.useState<SiteVisit[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getChromeRecentSites().then((next) => {
      if (cancelled) return;
      setSites(next.length ? next : MOST_VISITED);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const visibleSites = sites.length ? sites : MOST_VISITED;

  return (
    <div className="glass glass--lg mv">
      <div className="mv__head">
        <div className="mv__title">Most Visited Sites</div>
        <div className="mv__count">{loading ? 'loading' : chromeApi()?.history ? 'past week' : 'top sites'}</div>
      </div>
      <div className="mv__grid">
        {visibleSites.map((s) => (
          <a key={s.url} href={s.url} className="mv__tile" onClick={(e) => { e.preventDefault(); openUrl(s.url); }}>
            <span className="mv__icon" style={{ background: s.color }}>{s.title[0]}</span>
            <span className="mv__label">{s.title}</span>
            <span className="mv__visits">{s.visits}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function WallpaperCredit({
  wp,
  liked,
  onToggleLike,
  onNext,
  onPrev,
  onRefresh,
  refreshDisabled,
  remaining,
  limit,
  cachePosition,
  status,
}: {
  wp: RenderedWallpaper | LikedWallpaper | CachedUnsplashWallpaper;
  liked: boolean;
  onToggleLike: () => void;
  onNext: () => void;
  onPrev?: () => void;
  onRefresh?: () => void;
  refreshDisabled?: boolean;
  remaining?: number;
  limit?: number;
  cachePosition?: string;
  status?: string;
}) {
  const meta = 'photographer' in wp ? `${wp.photographer} · ${wp.location}` : 'Pinned wallpaper';
  const quota = remaining != null ? `${remaining}${limit ? `/${limit}` : ''} left` : undefined;
  return (
    <div className="glass glass--sm wp-credit">
      <button className={`wp-credit__heart ${liked ? 'is-liked' : ''}`} onClick={onToggleLike} aria-label={liked ? 'Unlike wallpaper' : 'Like wallpaper'}><svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg></button>
      <div className="wp-credit__text"><div className="wp-credit__name">{wp.name}</div><div className="wp-credit__meta">{[meta, cachePosition, quota, status].filter(Boolean).join(' · ')}</div></div>
      {onPrev && <button className="wp-credit__next" onClick={onPrev} aria-label="Previous cached wallpaper"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg></button>}
      {onRefresh && <button className="wp-credit__next" onClick={onRefresh} disabled={refreshDisabled} aria-label="Fetch new Unsplash wallpaper"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9M21 3v6h-6" /></svg></button>}
      <button className="wp-credit__next" onClick={onNext} aria-label="Next wallpaper"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg></button>
    </div>
  );
}
