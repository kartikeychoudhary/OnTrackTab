import type { Tweaks } from '../types';

export const TWEAK_DEFAULTS: Tweaks = {
  wallpaperId: 'big-sur',
  layout: 'floating',
  gridLayout: {
    search: { x: 21, y: 0, w: 15, h: 4, minW: 12, minH: 2, maxH: 6 },
    clock: { x: 0, y: 5, w: 9, h: 3, minW: 6, minH: 2, maxH: 3 },
    weather: { x: 0, y: 8, w: 9, h: 8, minW: 6, minH: 5 },
    calendar: { x: 0, y: 16, w: 9, h: 20, minW: 9, minH: 10 },
    notes: { x: 27, y: 23, w: 9, h: 13, minW: 6, minH: 8 },
    mostVisited: { x: 9, y: 8, w: 12, h: 10, minW: 9, minH: 5 },
  },
  glassBlur: 30,
  glassSat: 180,
  viewportZoom: 100,
  widgetSizes: { search: 'medium', clock: 'medium', weather: 'medium', calendar: 'medium', notes: 'medium', mostVisited: 'medium' },
  accent: '#ff8a5b',
  clockStyle: 'minimal',
  showSearch: true,
  showClock: true,
  showWeather: true,
  showCalendar: true,
  showNotes: true,
  showMostVisited: true,
};
