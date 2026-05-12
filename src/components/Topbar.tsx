import { ClockWidget } from './widgets';
import type { Tweaks } from '../types';

export function Topbar({ showClock, clockStyle }: { showClock: boolean; clockStyle: Tweaks['clockStyle'] }) {
  return (
    <div className="topbar">
      <div className="glass glass--sm topbar__brand">
        <span className="topbar__brand-mark">ZB</span>
        ZenBoard
        <span className="topbar__greet">· {greeting()}</span>
      </div>
      {showClock && (
        <div className="glass glass--sm">
          <ClockWidget style={clockStyle} />
        </div>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'still up?';
  if (h < 12) return 'good morning';
  if (h < 17) return 'good afternoon';
  if (h < 22) return 'good evening';
  return 'good night';
}
