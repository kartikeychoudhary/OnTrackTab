export type WidgetId = 'search' | 'clock' | 'weather' | 'calendar' | 'notes' | 'mostVisited';

export type LayoutMode = 'grid' | 'floating' | 'bento';
export type ClockStyle = 'minimal' | 'hero' | 'compact';
export type BackgroundType = 'generated' | 'unsplash' | 'image' | 'video';
export type WidgetSize = 'small' | 'medium' | 'large' | 'xl';

export interface GridItemLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type GridLayoutMap = Record<WidgetId, GridItemLayout>;
export type WidgetSizeMap = Record<WidgetId, WidgetSize>;

export interface WidgetPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  centerH?: boolean;
  centerV?: boolean;
  offsetX?: number;
  offsetY?: number;
}

export type WidgetPositionMap = Record<WidgetId, WidgetPosition>;

export interface Wallpaper {
  id: string;
  name: string;
  photographer: string;
  location: string;
  kind: 'light' | 'dark';
  paint: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface RenderedWallpaper extends Wallpaper {
  dataUrl: string;
  luminance: number;
}

export interface CachedUnsplashWallpaper {
  id: string;
  name: string;
  photographer: string;
  location: string;
  dataUrl: string;
  luminance: number;
  unsplashUrl: string;
  downloadLocation?: string;
  fetchedAt: number;
}

export interface LikedWallpaper {
  id: string;
  name: string;
  dataUrl: string;
  luminance?: number;
}

export interface Tweaks {
  wallpaperId: string;
  layout: LayoutMode;
  gridLayout: GridLayoutMap;
  glassBlur: number;
  glassSat: number;
  viewportZoom: number;
  widgetSizes: WidgetSizeMap;
  widgetPositions: WidgetPositionMap;
  accent: string;
  clockStyle: ClockStyle;
  showSearch: boolean;
  showClock: boolean;
  showWeather: boolean;
  showCalendar: boolean;
  showNotes: boolean;
  showMostVisited: boolean;
}

export interface BackgroundSettings {
  type: BackgroundType;
  imageUrl: string;
  videoUrl: string;
  dim: number;
  muted: boolean;
}

export interface Settings {
  tomorrowApiKey: string;
  unsplashApiKey: string;
  unsplashCacheSize: number;
  unsplashQuery: string;
  weatherLocations: string[];
  holidays: string;
  wallpaperRotateMinutes: number;
  showWidgets: Record<WidgetId, boolean>;
  searchEngine: string;
  startWeekOn: 'Sunday' | 'Monday';
  tempUnit: 'C' | 'F';
  background: BackgroundSettings;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportPayload {
  app: string;
  version: string;
  exportedAt: string;
  tweaks: Tweaks;
  settings: Settings;
  likedWallpapers: LikedWallpaper[];
  notes: Note[];
}

export interface EncryptedExport {
  app: string;
  version: string;
  exportedAt: string;
  encrypted: string;
  salt: string;
}
