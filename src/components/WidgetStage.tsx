import type React from 'react';
import { GridStage } from './GridStage';
import { CalendarWidget, ClockWidget, MostVisitedWidget, NotesWidget, SearchWidget, WeatherWidget } from './widgets';
import type { Settings, Tweaks, WidgetId, WidgetPosition, WidgetSize } from '../types';

function posToStyle(pos: WidgetPosition): React.CSSProperties {
  const style: React.CSSProperties = { position: 'absolute' };
  if (pos.centerH) {
    style.left = '50%';
    if (pos.offsetX != null) style.transform = `translateX(calc(-50% + ${pos.offsetX}%))`;
    else style.transform = 'translateX(-50%)';
  } else {
    if (pos.left != null) style.left = pos.left;
    if (pos.right != null) style.right = pos.right;
  }
  if (pos.centerV) {
    style.top = '50%';
    if (pos.offsetY != null) {
      style.transform = style.transform
        ? `${style.transform} translateY(calc(-50% + ${pos.offsetY}%))`
        : `translateY(calc(-50% + ${pos.offsetY}%))`;
    } else {
      style.transform = style.transform
        ? `${style.transform} translateY(-50%)`
        : 'translateY(-50%)';
    }
  } else {
    if (pos.top != null) style.top = pos.top;
    if (pos.bottom != null) style.bottom = pos.bottom;
  }
  return style;
}

export function WidgetStage({
  editMode,
  isGrid,
  onGridLayoutChange,
  settings,
  showWidgets,
  tweaks,
  onError,
}: {
  editMode: boolean;
  isGrid: boolean;
  onGridLayoutChange: (layout: Tweaks['gridLayout']) => void;
  settings: Settings;
  showWidgets: Record<WidgetId, boolean>;
  tweaks: Tweaks;
  onError?: (message: string) => void;
}) {
  if (isGrid) {
    return (
      <GridStage
        editMode={editMode}
        layout={tweaks.gridLayout}
        onLayoutChange={onGridLayoutChange}
        visibility={showWidgets}
        items={[
          { id: 'search', node: <SearchWidget searchEngine={settings.searchEngine} /> },
          { id: 'clock', node: <GridClock clockStyle={tweaks.clockStyle} /> },
          { id: 'weather', node: <WeatherWidget locations={settings.weatherLocations} apiKey={settings.tomorrowApiKey} tempUnit={settings.tempUnit} onError={onError} /> },
          { id: 'calendar', node: <CalendarWidget holidays={settings.holidays} /> },
          { id: 'notes', node: <NotesWidget /> },
          { id: 'mostVisited', node: <MostVisitedWidget /> },
        ]}
      />
    );
  }

  const isFloating = tweaks.layout === 'floating';

  return (
    <>
      {showWidgets.clock && tweaks.layout !== 'floating' && <WidgetShell id="clock" size={tweaks.widgetSizes.clock}><ClockWidget style={tweaks.clockStyle} /></WidgetShell>}
      {showWidgets.clock && tweaks.layout === 'floating' && tweaks.clockStyle === 'hero' && <WidgetShell id="clock" size={tweaks.widgetSizes.clock} position={tweaks.widgetPositions.clock}><ClockWidget style="hero" /></WidgetShell>}
      {showWidgets.search && <WidgetShell id="search" size={tweaks.widgetSizes.search} position={isFloating ? tweaks.widgetPositions.search : undefined}><SearchWidget searchEngine={settings.searchEngine} /></WidgetShell>}
      {showWidgets.weather && <WidgetShell id="weather" size={tweaks.widgetSizes.weather} position={isFloating ? tweaks.widgetPositions.weather : undefined}><WeatherWidget locations={settings.weatherLocations} apiKey={settings.tomorrowApiKey} tempUnit={settings.tempUnit} onError={onError} /></WidgetShell>}
      {showWidgets.calendar && <WidgetShell id="calendar" size={tweaks.widgetSizes.calendar} position={isFloating ? tweaks.widgetPositions.calendar : undefined}><CalendarWidget holidays={settings.holidays} /></WidgetShell>}
      {showWidgets.notes && <WidgetShell id="notes" size={tweaks.widgetSizes.notes} position={isFloating ? tweaks.widgetPositions.notes : undefined}><NotesWidget /></WidgetShell>}
      {showWidgets.mostVisited && <WidgetShell id="mostVisited" size={tweaks.widgetSizes.mostVisited} position={isFloating ? tweaks.widgetPositions.mostVisited : undefined}><MostVisitedWidget /></WidgetShell>}
    </>
  );
}

function WidgetShell({ id, size, position, children }: { id: WidgetId; size: WidgetSize; position?: WidgetPosition; children: React.ReactNode }) {
  const className = id === 'mostVisited' ? 'pos-mv' : `pos-${id}`;
  const style = position ? posToStyle(position) : undefined;
  return <div className={`${className} widget-shell widget-shell--${size}`} style={style}>{children}</div>;
}

function GridClock({ clockStyle }: { clockStyle: Tweaks['clockStyle'] }) {
  return (
    <div className="glass glass--lg" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <ClockWidget style={clockStyle === 'hero' ? 'compact' : clockStyle} />
    </div>
  );
}
