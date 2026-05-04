import React from 'react';
import ReactGridLayout, { type Layout } from 'react-grid-layout';
import type { GridLayoutMap, WidgetId } from '../types';

export const GRID_COLS = 36;
const GRID_ROW_HEIGHT = 28;
const GRID_MARGIN: [number, number] = [6, 6];
const GRID_PADDING: [number, number] = [8, 12];

export const DEFAULT_LAYOUT: GridLayoutMap = {
  search: { x: 9, y: 0, w: 18, h: 3, minW: 12, minH: 2, maxH: 6 },
  clock: { x: 0, y: 0, w: 9, h: 3, minW: 6, minH: 2, maxH: 3 },
  weather: { x: 27, y: 0, w: 9, h: 8, minW: 6, minH: 5 },
  calendar: { x: 0, y: 3, w: 9, h: 13, minW: 9, minH: 10 },
  notes: { x: 27, y: 8, w: 9, h: 13, minW: 6, minH: 8 },
  mostVisited: { x: 9, y: 16, w: 18, h: 8, minW: 9, minH: 5 },
};

const WIDGET_LABELS: Record<WidgetId, string> = {
  search: 'Search',
  clock: 'Clock',
  weather: 'Weather',
  calendar: 'Calendar',
  notes: 'Notes',
  mostVisited: 'Most Visited',
};

function toRGL(layoutMap: GridLayoutMap, visibility: Record<WidgetId, boolean>): Layout[] {
  return Object.entries(layoutMap)
    .filter(([id]) => visibility[id as WidgetId])
    .map(([id, r]) => ({ i: id, x: r.x, y: r.y, w: r.w, h: r.h, minW: r.minW, minH: r.minH, maxW: r.maxW, maxH: r.maxH }));
}

function fromRGL(arr: Layout[], prev: GridLayoutMap): GridLayoutMap {
  const out = { ...prev };
  arr.forEach((item) => {
    out[item.i as WidgetId] = { ...prev[item.i as WidgetId], x: item.x, y: item.y, w: item.w, h: item.h };
  });
  return out;
}

export function GridStage({
  editMode,
  layout,
  onLayoutChange,
  items,
  visibility,
}: {
  editMode: boolean;
  layout: GridLayoutMap;
  onLayoutChange: (layout: GridLayoutMap) => void;
  items: Array<{ id: WidgetId; node: React.ReactNode }>;
  visibility: Record<WidgetId, boolean>;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(1200);

  React.useLayoutEffect(() => {
    if (!containerRef.current) return undefined;
    const measure = () => setWidth(containerRef.current?.getBoundingClientRect().width || 1200);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    const same = newLayout.every((item) => {
      const prev = layout[item.i as WidgetId];
      return prev && prev.x === item.x && prev.y === item.y && prev.w === item.w && prev.h === item.h;
    });
    if (!same) onLayoutChange(fromRGL(newLayout, layout));
  };

  return (
    <div
      ref={containerRef}
      className={`grid-stage ${editMode ? 'is-editing' : ''}`}
      style={{
        '--grid-pad-x': `${GRID_PADDING[0]}px`,
        '--grid-pad-y': `${GRID_PADDING[1]}px`,
        '--grid-col-step': `${(width - GRID_PADDING[0] * 2 - GRID_MARGIN[0] * (GRID_COLS - 1)) / GRID_COLS + GRID_MARGIN[0]}px`,
        '--grid-row-step': `${GRID_ROW_HEIGHT + GRID_MARGIN[1]}px`,
      } as React.CSSProperties}
    >
      <ReactGridLayout
        className="rgl-root"
        layout={toRGL(layout, visibility)}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        width={width}
        margin={GRID_MARGIN}
        containerPadding={GRID_PADDING}
        isDraggable={editMode}
        isResizable={editMode}
        compactType={null}
        preventCollision
        allowOverlap={false}
        useCSSTransforms
        draggableHandle=".grid-handle--move"
        resizeHandles={['se']}
        onLayoutChange={handleLayoutChange}
      >
        {items.filter((it) => visibility[it.id]).map((it) => (
          <div key={it.id} className="grid-item">
            {editMode && (
              <div className="grid-handle grid-handle--move" title={`Drag ${WIDGET_LABELS[it.id]}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                </svg>
                <span>{WIDGET_LABELS[it.id]}</span>
              </div>
            )}
            <div className="grid-item__content">{it.node}</div>
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}
