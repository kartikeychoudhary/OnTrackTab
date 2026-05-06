import type React from 'react';
import { GridStage } from './GridStage';
import { CalendarWidget, ClockWidget, MostVisitedWidget, NotesWidget, SearchWidget, WeatherWidget } from './widgets';
import type { Settings, Tweaks, WidgetId, WidgetSize } from '../types';

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

  return (
    <>
      {showWidgets.clock && tweaks.layout !== 'floating' && <WidgetShell id="clock" size={tweaks.widgetSizes.clock}><ClockWidget style={tweaks.clockStyle} /></WidgetShell>}
      {showWidgets.clock && tweaks.layout === 'floating' && tweaks.clockStyle === 'hero' && <WidgetShell id="clock" size={tweaks.widgetSizes.clock}><ClockWidget style="hero" /></WidgetShell>}
      {showWidgets.search && <WidgetShell id="search" size={tweaks.widgetSizes.search}><SearchWidget searchEngine={settings.searchEngine} /></WidgetShell>}
      {showWidgets.weather && <WidgetShell id="weather" size={tweaks.widgetSizes.weather}><WeatherWidget locations={settings.weatherLocations} apiKey={settings.tomorrowApiKey} tempUnit={settings.tempUnit} onError={onError} /></WidgetShell>}
      {showWidgets.calendar && <WidgetShell id="calendar" size={tweaks.widgetSizes.calendar}><CalendarWidget holidays={settings.holidays} /></WidgetShell>}
      {showWidgets.notes && <WidgetShell id="notes" size={tweaks.widgetSizes.notes}><NotesWidget /></WidgetShell>}
      {showWidgets.mostVisited && <WidgetShell id="mostVisited" size={tweaks.widgetSizes.mostVisited}><MostVisitedWidget /></WidgetShell>}
    </>
  );
}

function WidgetShell({ id, size, children }: { id: WidgetId; size: WidgetSize; children: React.ReactNode }) {
  const className = id === 'mostVisited' ? 'pos-mv' : `pos-${id}`;
  return <div className={`${className} widget-shell widget-shell--${size}`}>{children}</div>;
}

function GridClock({ clockStyle }: { clockStyle: Tweaks['clockStyle'] }) {
  return (
    <div className="glass glass--lg" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <ClockWidget style={clockStyle === 'hero' ? 'compact' : clockStyle} />
    </div>
  );
}
