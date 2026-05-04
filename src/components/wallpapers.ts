import type { Wallpaper } from '../types';

export const WALLPAPER_BANK: Wallpaper[] = [
  {
    id: 'tahoe-dawn',
    name: 'Tahoe Dawn',
    photographer: 'Mira Okafor',
    location: 'Lake Tahoe, CA',
    kind: 'dark',
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a1628');
      g.addColorStop(0.45, '#1a2d4a');
      g.addColorStop(0.7, '#3a4e6e');
      g.addColorStop(1, '#6b7a96');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const sun = ctx.createRadialGradient(w * 0.72, h * 0.62, 0, w * 0.72, h * 0.62, w * 0.45);
      sun.addColorStop(0, 'rgba(255, 180, 120, 0.55)');
      sun.addColorStop(0.4, 'rgba(255, 130, 90, 0.18)');
      sun.addColorStop(1, 'rgba(255, 130, 90, 0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0e1a2c';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w * 0.18, h * 0.55);
      ctx.lineTo(w * 0.32, h * 0.68);
      ctx.lineTo(w * 0.48, h * 0.48);
      ctx.lineTo(w * 0.65, h * 0.62);
      ctx.lineTo(w * 0.82, h * 0.5);
      ctx.lineTo(w, h * 0.65);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: 'kyoto-mist',
    name: 'Kyoto Mist',
    photographer: 'Hina Tanaka',
    location: 'Arashiyama, Kyoto',
    kind: 'light',
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#e8e1d4');
      g.addColorStop(0.5, '#cfd2c4');
      g.addColorStop(1, '#9aa896');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i += 1) {
        const x = (i / 22) * w + Math.sin(i * 1.7) * 12;
        ctx.fillStyle = `rgba(70, 90, 60, ${0.08 + (i % 4) * 0.04})`;
        ctx.fillRect(x, 0, 6 + (i % 3) * 4, h);
      }
      const mist = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.85);
      mist.addColorStop(0, 'rgba(232, 225, 212, 0)');
      mist.addColorStop(0.5, 'rgba(232, 225, 212, 0.55)');
      mist.addColorStop(1, 'rgba(232, 225, 212, 0.85)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: 'dolomites',
    name: 'Dolomites',
    photographer: 'Luca Bertini',
    location: 'South Tyrol, Italy',
    kind: 'dark',
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a1f2e');
      g.addColorStop(0.4, '#2c3548');
      g.addColorStop(0.7, '#4a5570');
      g.addColorStop(1, '#1f2638');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i += 1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 3) * 0.2})`;
        ctx.fillRect((i * 137.5) % w, (i * 73) % (h * 0.5), 1.5, 1.5);
      }
      ctx.fillStyle = '#2a3245';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w * 0.08, h * 0.45);
      ctx.lineTo(w * 0.22, h * 0.38);
      ctx.lineTo(w * 0.4, h * 0.32);
      ctx.lineTo(w * 0.6, h * 0.36);
      ctx.lineTo(w * 0.85, h * 0.4);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: 'sahara',
    name: 'Sahara',
    photographer: 'Nour El-Sayed',
    location: 'Erg Chebbi, Morocco',
    kind: 'light',
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#f4d4a8');
      g.addColorStop(0.4, '#e8b075');
      g.addColorStop(0.7, '#c98855');
      g.addColorStop(1, '#8a4f2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const drawDune = (yBase: number, color: string, peaks: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let i = 0; i <= peaks; i += 1) ctx.lineTo((i / peaks) * w, yBase + Math.sin(i * 1.3) * 30 - 10);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
      };
      drawDune(h * 0.6, '#b97548', 5);
      drawDune(h * 0.75, '#8a5230', 4);
      drawDune(h * 0.88, '#5e3820', 3);
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    photographer: 'Saga Lindqvist',
    location: 'Tromso, Norway',
    kind: 'dark',
    paint: (ctx, w, h) => {
      ctx.fillStyle = '#03070f';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 150; i += 1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + (i % 4) * 0.2})`;
        ctx.fillRect((i * 191.7) % w, (i * 83.3) % h, 1, 1);
      }
      const band = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.65);
      band.addColorStop(0, 'rgba(52, 211, 153, 0)');
      band.addColorStop(0.35, 'rgba(52, 211, 153, 0.5)');
      band.addColorStop(0.55, 'rgba(34, 211, 238, 0.35)');
      band.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#020610';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w * 0.3, h * 0.74);
      ctx.lineTo(w * 0.55, h * 0.8);
      ctx.lineTo(w * 0.8, h * 0.72);
      ctx.lineTo(w, h * 0.78);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: 'big-sur',
    name: 'Big Sur',
    photographer: 'James Whitford',
    location: 'California Coast',
    kind: 'light',
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#ffd9b8');
      g.addColorStop(0.35, '#f5b48a');
      g.addColorStop(0.6, '#7a9bb5');
      g.addColorStop(1, '#3d556e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const sun = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, h * 0.5);
      sun.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
      sun.addColorStop(0.3, 'rgba(255, 200, 150, 0.4)');
      sun.addColorStop(1, 'rgba(255, 200, 150, 0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a3a4a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.bezierCurveTo(w * 0.2, h * 0.55, w * 0.35, h * 0.78, w * 0.45, h * 0.72);
      ctx.lineTo(w * 0.45, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    },
  },
];
