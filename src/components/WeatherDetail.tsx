import React from 'react';
import { createPortal } from 'react-dom';
import type { WeatherData } from './widgets';

interface WeatherDetailProps {
  data: WeatherData;
  location: string;
  tempUnit: 'C' | 'F';
  onClose: () => void;
  triggerRect?: DOMRect;
}

function windDirectionLabel(deg?: number): string {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return ' ' + dirs[Math.round(deg / 45) % 8];
}

export function WeatherDetail({ data, location, tempUnit, onClose, triggerRect }: WeatherDetailProps) {
  const [phase, setPhase] = React.useState<'entering' | 'entered' | 'exiting'>('entering');

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => setPhase('entered'));
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const close = () => {
    setPhase('exiting');
    setTimeout(onClose, 280);
  };

  const updated = data.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Temperature', value: `${data.temp}°${tempUnit}` },
    { label: 'Feels Like', value: `${data.feelsLike}°${tempUnit}` },
    { label: 'Condition', value: data.cond },
    { label: 'Humidity', value: `${data.humidity}%` },
    { label: 'Wind', value: `${data.wind} ${tempUnit === 'F' ? 'mph' : 'km/h'}${windDirectionLabel(data.windDirection)}` },
  ];

  if (data.tempHigh != null && data.tempLow != null) {
    rows.push({ label: 'High / Low', value: `${data.tempHigh}° / ${data.tempLow}°` });
  }
  if (data.sunriseTime) {
    rows.push({ label: 'Sunrise', value: data.sunriseTime });
  }
  if (data.sunsetTime) {
    rows.push({ label: 'Sunset', value: data.sunsetTime });
  }
  if (data.visibility != null) {
    rows.push({ label: 'Visibility', value: `${data.visibility} km` });
  }
  if (data.uvIndex != null) {
    rows.push({ label: 'UV Index', value: String(data.uvIndex) });
  }
  if (data.pressureSurfaceLevel != null) {
    rows.push({ label: 'Pressure', value: `${data.pressureSurfaceLevel} hPa` });
  }

  const originStyle: React.CSSProperties = {};
  if (triggerRect) {
    const cx = triggerRect.left + triggerRect.width / 2;
    const cy = triggerRect.top + triggerRect.height / 2;
    originStyle.transformOrigin = `${cx}px ${cy}px`;
  }

  const content = (
    <div
      className={`weather-detail-overlay ${phase === 'exiting' ? 'is-exiting' : ''}`}
      onClick={close}
    >
      <div
        className={`weather-detail ${phase === 'entering' ? 'is-entering' : phase === 'entered' ? 'is-entered' : 'is-exiting'}`}
        style={originStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="weather-detail__head">
          <div className="weather-detail__location">{location}</div>
          <button className="weather-detail__close" onClick={close} aria-label="Close">×</button>
        </div>
        <div className="weather-detail__temp">{data.temp}<span className="weather-detail__unit">°{tempUnit}</span></div>
        <div className="weather-detail__cond">{data.cond}</div>
        <div className="weather-detail__grid">
          {rows.map((row) => (
            <div key={row.label} className="weather-detail__item">
              <div className="weather-detail__item-label">{row.label}</div>
              <div className="weather-detail__item-value">{row.value}</div>
            </div>
          ))}
        </div>
        {updated && (
          <div className="weather-detail__footer">
            {data.source === 'api' ? `Updated ${updated}` : data.source === 'cache' ? `Cached ${updated}` : 'Demo data'} · Powered by Tomorrow.io
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
