import React from 'react';
import { useStoredState } from '../hooks/useStoredState';
import { renderMarkdown } from '../lib/markdown';
import type { Note } from '../types';

const DEFAULT_NOTES: Note[] = [];

function todayTitle(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function uniqueTag(): string {
  return crypto.randomUUID().slice(0, 8);
}

function defaultTitle(): string {
  return `${todayTitle()}_${uniqueTag()}`;
}

function sortByDateDesc(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function NotesWidget() {
  const [notes, setNotes] = useStoredState<Note[]>('ott-notes-v2', DEFAULT_NOTES);
  const [view, setView] = React.useState<'list' | 'detail'>('list');
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState('');
  const [titleError, setTitleError] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [content, setContent] = React.useState('');
  const [editing, setEditing] = React.useState(true);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  const saveNote = React.useCallback((note: Note) => {
    const title = note.title.trim();
    if (!title) return;
    setNotes((prev) => {
      const existing = prev.find((n) => n.id === note.id);
      if (existing) {
        return prev.map((n) => n.id === note.id ? { ...note, updatedAt: new Date().toISOString(), title } : n);
      }
      return [...prev, { ...note, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  }, [setNotes]);

  const handleCheckboxToggle = React.useCallback((lineIndex: number, checked: boolean) => {
    if (!activeNote) return;
    const lines = content.split('\n');
    let todoCount = 0;
    const newLines = lines.map((line) => {
      if (/^[-*]\s+\[( |x|X)\]\s+/.test(line)) {
        if (todoCount === lineIndex) {
          const newLine = checked
            ? line.replace(/\[( |x|X)\]/, '[x]')
            : line.replace(/\[(x|X)\]/, '[ ]');
          todoCount += 1;
          return newLine;
        }
        todoCount += 1;
      }
      return line;
    });
    const newContent = newLines.join('\n');
    setContent(newContent);
    setNotes((prev) => prev.map((n) => n.id === activeNote.id ? { ...n, content: newContent, updatedAt: new Date().toISOString() } : n));
  }, [activeNote, content, setNotes]);

  const openNote = React.useCallback((id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setActiveId(id);
      setContent(note.content);
      setView('detail');
    }
  }, [notes]);

  const createNewNote = React.useCallback(() => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: defaultTitle(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note]);
    setActiveId(note.id);
    setContent('');
    setView('detail');
  }, [setNotes]);

  const goToToday = React.useCallback(() => {
    const today = todayTitle();
    const existing = notes.find((n) => n.title === today || n.title.startsWith(today));
    if (existing) {
      openNote(existing.id);
      return;
    }
    const note: Note = {
      id: crypto.randomUUID(),
      title: defaultTitle(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note]);
    setActiveId(note.id);
    setContent('');
    setView('detail');
  }, [notes, openNote, setNotes]);

  const deleteNote = React.useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setView('list');
    }
  }, [activeId, setNotes]);

  const handleTitleSave = React.useCallback(() => {
    if (!activeNote) return;
    const trimmed = titleInput.trim();
    if (!trimmed) {
      setTitleError('Title cannot be empty');
      setTitleInput(activeNote.title);
      setEditingTitle(false);
      return;
    }
    const duplicate = notes.find((n) => n.id !== activeNote.id && n.title === trimmed);
    if (duplicate) {
      setTitleError('Title must be unique');
      return;
    }
    setTitleError('');
    setNotes((prev) => prev.map((n) => n.id === activeNote.id ? { ...n, title: trimmed, updatedAt: new Date().toISOString() } : n));
    setEditingTitle(false);
  }, [activeNote, titleInput, notes, setNotes]);

  React.useEffect(() => {
    if (activeNote) {
      setTitleInput(activeNote.title);
      setTitleError('');
      setContent(activeNote.content);
    }
  }, [activeNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize with default note if empty
  React.useEffect(() => {
    if (notes.length === 0) {
      const defaultContent = '# Today\n- [x] Ship the ZenBoard prototype\n- [ ] Review weather widget icons\n- [ ] Reply to **Sara** about Q2 plan';
      const note: Note = {
        id: crypto.randomUUID(),
        title: defaultTitle(),
        content: defaultContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([note]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredNotes = React.useMemo(() => {
    const sorted = sortByDateDesc(notes);
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  // List View
  if (view === 'list') {
    return (
      <div className="glass glass--lg notes notes--list">
        <div className="notes__head">
          <div className="notes__title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
            Notes
          </div>
          <div className="notes__head-actions">
            <button className="notes__action-btn" onClick={goToToday} title="Today's note" aria-label="Go to today's note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            </button>
            <button className="notes__action-btn notes__action-btn--primary" onClick={createNewNote} title="New note" aria-label="Create new note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </div>
        <div className="notes__search-wrap">
          <svg className="notes__search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
          <input className="notes__search" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="notes__list">
          {filteredNotes.length === 0 ? (
            <div className="notes__empty">No notes yet. Create one!</div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="notes__list-item" onClick={() => openNote(note.id)}>
                <div className="notes__list-item-title">{note.title}</div>
                <div className="notes__list-item-meta">{new Date(note.updatedAt).toLocaleDateString()} · {note.content.split('\n').length} lines</div>
                <button className="notes__list-item-delete" onClick={(e) => deleteNote(note.id, e)} aria-label="Delete note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Detail View
  if (!activeNote) return null;

  const htmlContent = renderMarkdown(
    content,
    handleCheckboxToggle,
  );

  return (
    <div className="glass glass--lg notes notes--detail">
      <div className="notes__head">
        <button className="notes__action-btn" onClick={() => setView('list')} aria-label="Back to notes list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        {editingTitle ? (
          <input
            className={`notes__title-input ${titleError ? 'notes__title-input--error' : ''}`}
            value={titleInput}
            onChange={(e) => {
              setTitleInput(e.target.value);
              if (titleError) setTitleError('');
            }}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setTitleInput(activeNote.title);
                setEditingTitle(false);
                setTitleError('');
              }
            }}
            autoFocus
          />
        ) : (
          <div className="notes__title notes__title--editable" onClick={() => {
            setTitleInput(activeNote.title);
            setEditingTitle(true);
            setTitleError('');
          }}>
            {activeNote.title}
          </div>
        )}
        <button className="notes__toggle" onClick={() => setEditing((e) => !e)}>
          {editing ? 'Preview' : 'Edit'}
        </button>
        <button
          className="notes__action-btn notes__action-btn--primary"
          onClick={() => saveNote({ ...activeNote, content })}
          title="Save note"
          aria-label="Save note"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
        </button>
      </div>
      {editing ? (
        <textarea
          className="notes__editor notes__editor--detail"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          placeholder="Write markdown here..."
          autoFocus
        />
      ) : (
        <div className="notes__preview notes__preview--detail">
          <div className="md-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      )}
      <div className="notes__foot">
        <span>markdown</span>
        <span>{content.split('\n').length} lines · {content.length} chars</span>
      </div>
    </div>
  );
}
