import { DEFAULT_LAYOUT, GRID_COLS } from '../components/GridStage';
import type { Tweaks } from '../types';

export function normalizeTweaks(tweaks: Tweaks): Tweaks {
  const entries = Object.values(tweaks.gridLayout);
  const maxRight = Math.max(...entries.map((item) => item.x + item.w), 0);
  const migrationScale = maxRight <= 12 ? { x: 3, y: 2.5 } : maxRight <= 24 ? { x: 1.5, y: 1.25 } : null;
  const scaledLayout = migrationScale
    ? Object.fromEntries(Object.entries(tweaks.gridLayout).map(([id, item]) => [id, {
      ...item,
      x: Math.round(item.x * migrationScale.x),
      y: Math.round(item.y * migrationScale.y),
      w: Math.max(1, Math.round(item.w * migrationScale.x)),
      h: Math.max(1, Math.round(item.h * migrationScale.y)),
      minW: item.minW == null ? undefined : Math.max(1, Math.round(item.minW * migrationScale.x)),
      maxW: item.maxW == null ? undefined : Math.max(1, Math.round(item.maxW * migrationScale.x)),
      minH: item.minH == null ? undefined : Math.max(1, Math.round(item.minH * migrationScale.y)),
      maxH: item.maxH == null ? undefined : Math.max(1, Math.round(item.maxH * migrationScale.y)),
    }])) as Tweaks['gridLayout']
    : tweaks.gridLayout;
  const searchLayout = scaledLayout.search;
  const calendarLayout = scaledLayout.calendar;
  const storedWidgetSizes = tweaks.widgetSizes || {};
  const widgetSizes = {
    search: storedWidgetSizes.search || 'medium',
    clock: storedWidgetSizes.clock || 'medium',
    weather: storedWidgetSizes.weather || 'medium',
    calendar: storedWidgetSizes.calendar || 'medium',
    notes: storedWidgetSizes.notes || 'medium',
    mostVisited: storedWidgetSizes.mostVisited || 'medium',
  } as Tweaks['widgetSizes'];
  const viewportZoom = Number.isFinite(tweaks.viewportZoom) ? Math.min(140, Math.max(70, Math.round(tweaks.viewportZoom))) : 100;
  const needsSearchBounds = !searchLayout || (searchLayout.minH || 0) < 2 || searchLayout.h < 2 || (searchLayout.minW || 0) < 12;
  const needsCalendarBounds = !calendarLayout || calendarLayout.h < 13 || (calendarLayout.minH || 0) < 10 || (calendarLayout.minW || 0) < 9;
  const needsColumnClamp = Object.values(scaledLayout).some((item) => item.x + item.w > GRID_COLS);
  const needsWidgetSizeDefaults = !tweaks.widgetSizes || Object.entries(widgetSizes).some(([id, size]) => tweaks.widgetSizes[id as keyof Tweaks['widgetSizes']] !== size);
  const needsTweakDefaults = needsWidgetSizeDefaults || tweaks.viewportZoom !== viewportZoom;
  if (!migrationScale && !needsSearchBounds && !needsCalendarBounds && !needsColumnClamp && !needsTweakDefaults) return tweaks;

  const nextLayout = Object.fromEntries(Object.entries(scaledLayout).map(([id, item]) => [id, {
    ...item,
    x: Math.min(item.x, Math.max(0, GRID_COLS - Math.min(item.w, GRID_COLS))),
    w: Math.min(item.w, GRID_COLS),
  }])) as Tweaks['gridLayout'];

  const nextSearch = nextLayout.search || DEFAULT_LAYOUT.search;
  const nextCalendar = nextLayout.calendar || DEFAULT_LAYOUT.calendar;
  return {
    ...tweaks,
    viewportZoom,
    widgetSizes,
    gridLayout: {
      ...nextLayout,
      search: {
        ...nextSearch,
        h: Math.max(nextSearch.h, 2),
        minW: Math.max(nextSearch.minW || 0, 12),
        minH: Math.max(nextSearch.minH || 0, 2),
        maxH: Math.max(nextSearch.maxH || 0, 6),
      },
      calendar: {
        ...nextCalendar,
        h: Math.max(nextCalendar.h, 13),
        minW: Math.max(nextCalendar.minW || 0, 9),
        minH: Math.max(nextCalendar.minH || 0, 10),
      },
    },
  };
}
