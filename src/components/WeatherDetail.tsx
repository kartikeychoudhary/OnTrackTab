import React from 'react';
import type { WeatherData } from './widgets';

interface WeatherDetailProps {
  data: WeatherData;
  location: string;
  tempUnit: 'C' | 'F';
  onClose: () => void;
}

function windDirectionLabel(deg?: number): string {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return ' ' + dirs[Math.round(deg / 45) % 8];
}

export function WeatherDetail({ data, location, tempUnit, onClose }: WeatherDetailProps) {
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

  if (data.visibility != null) {
    rows.push({ label: 'Visibility', value: `${data.visibility} km` });
  }
  if (data.uvIndex != null) {
    rows.push({ label: 'UV Index', value: String(data.uvIndex) });
  }
  if (data.pressureSurfaceLevel != null) {
    rows.push({ label: 'Pressure', value: `${data.pressureSurfaceLevel} hPa` });
  }

  return (
    <div className="weather-detail-overlay" onClick={onClose}>
      <div className="weather-detail" onClick={(e) => e.stopPropagation()}>
        <div className="weather-detail__head">
          <div className="weather-detail__location">{location}</div>
          <button className="weather-detail__close" onClick={onClose} aria-label="Close">×</button>
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
}
