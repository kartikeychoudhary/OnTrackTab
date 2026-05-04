import type { BackgroundSettings } from '../types';

export function StageBackground({ background, imageUrl }: { background: BackgroundSettings; imageUrl: string }) {
  if (background.type === 'video' && background.videoUrl) {
    return <video className="stage__video" src={background.videoUrl} autoPlay loop muted={background.muted} playsInline />;
  }

  return <div className="stage__wallpaper" style={{ backgroundImage: `url(${imageUrl})` }} />;
}
