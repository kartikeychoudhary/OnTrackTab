declare module 'react-grid-layout' {
  import type { ComponentType } from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  }

  interface ReactGridLayoutProps {
    className?: string;
    layout?: Layout[];
    cols?: number;
    rowHeight?: number;
    width?: number;
    margin?: [number, number];
    containerPadding?: [number, number];
    isDraggable?: boolean;
    isResizable?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    preventCollision?: boolean;
    allowOverlap?: boolean;
    useCSSTransforms?: boolean;
    draggableHandle?: string;
    resizeHandles?: string[];
    onLayoutChange?: (layout: Layout[]) => void;
    children?: React.ReactNode;
  }

  const ReactGridLayout: ComponentType<ReactGridLayoutProps>;
  export default ReactGridLayout;
}
