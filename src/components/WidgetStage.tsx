import { GridStage } from './GridStage';
import { CalendarWidget, ClockWidget, MostVisitedWidget, NotesWidget, SearchWidget, WeatherWidget } from './widgets';
import type { Settings, Tweaks, WidgetId } from '../types';

export function WidgetStage({
  editMode,
  isGrid,
  onGridLayoutChange,
  settings,
  showWidgets,
  tweaks,
}: {
  editMode: boolean;
  isGrid: boolean;
  onGridLayoutChange: (layout: Tweaks['gridLayout']) => void;
  settings: Settings;
  showWidgets: Record<WidgetId, boolean>;
  tweaks: Tweaks;
}) {
  if (isGrid) {
    return (
      <GridStage
        editMode={editMode}
        layout={tweaks.gridLayout}
        onLayoutChange={onGridLayoutChange}
        visibility={showWidgets}
        items={[
          { id: 'search', node: <SearchWidget /> },
          { id: 'clock', node: <GridClock clockStyle={tweaks.clockStyle} /> },
          { id: 'weather', node: <WeatherWidget locations={settings.weatherLocations} apiKey={settings.tomorrowApiKey} tempUnit={settings.tempUnit} /> },
          { id: 'calendar', node: <CalendarWidget holidays={settings.holidays} /> },
          { id: 'notes', node: <NotesWidget /> },
          { id: 'mostVisited', node: <MostVisitedWidget /> },
        ]}
      />
    );
  }

  return (
    <>
      {showWidgets.clock && tweaks.layout !== 'floating' && <div className="pos-clock"><ClockWidget style={tweaks.clockStyle} /></div>}
      {showWidgets.clock && tweaks.layout === 'floating' && tweaks.clockStyle === 'hero' && <div className="pos-clock"><ClockWidget style="hero" /></div>}
      {showWidgets.search && <div className="pos-search"><SearchWidget /></div>}
      {showWidgets.weather && <div className="pos-weather"><WeatherWidget locations={settings.weatherLocations} apiKey={settings.tomorrowApiKey} tempUnit={settings.tempUnit} /></div>}
      {showWidgets.calendar && <div className="pos-calendar"><CalendarWidget holidays={settings.holidays} /></div>}
      {showWidgets.notes && <div className="pos-notes"><NotesWidget /></div>}
      {showWidgets.mostVisited && <div className="pos-mv"><MostVisitedWidget /></div>}
    </>
  );
}

function GridClock({ clockStyle }: { clockStyle: Tweaks['clockStyle'] }) {
  return (
    <div className="glass glass--lg" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <ClockWidget style={clockStyle === 'hero' ? 'compact' : clockStyle} />
    </div>
  );
}
