import { DEFAULT_LAYOUT } from './GridStage';
import type { Tweaks } from '../types';

export function EditToolbar({
  onDone,
  onReset,
}: {
  onDone: () => void;
  onReset: (layout: Tweaks['gridLayout']) => void;
}) {
  return (
    <div className="edit-toolbar">
      <span className="edit-toolbar__label">
        <span className="edit-toolbar__dot" />
        Editing layout
      </span>
      <span className="edit-toolbar__sep" />
      <button className="edit-toolbar__btn" onClick={() => onReset(DEFAULT_LAYOUT)}>Reset</button>
      <button className="edit-toolbar__btn edit-toolbar__btn--primary" onClick={onDone}>Done</button>
    </div>
  );
}
