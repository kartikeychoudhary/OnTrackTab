# ZenBoard v1.1.0 Release Notes

## What's New

### Multi-Note System
- Maintain multiple markdown notes with a list/detail view
- Search bar to filter notes by title or content
- Notes sorted by date (newest first)
- Click-to-edit note titles with duplicate/empty validation
- One-click shortcut to today's date note
- Auto-save with date-based naming

### Encrypted Data Export/Import
- New "Data" section in Settings for full data management
- Export all data (settings, tweaks, wallpapers, notes) as encrypted .ottdata
- Password-protected AES-256-GCM encryption via Web Crypto API
- Import with same password to restore all data
- Export button shows loading spinner during encryption

### MP4 Video Background
- Browse and select local MP4 files (max 50MB) as video backgrounds
- Files play as muted looping backgrounds (session-only)

### Detailed Weather View
- Click "More" on the weather card for expanded details
- See humidity, wind speed/direction, visibility, UV index, and pressure
- Powered by Tomorrow.io API

### Markdown Improvements
- Full CommonMark + GFM support (headings, bold, italic, lists, code, tables, etc.)
- Interactive task list checkboxes
- Proper markdown sanitization for security via DOMPurify
- Markdown rendered using the `marked` library

## Bug Fixes
- Fixed version number showing 1.0.3 instead of 1.0.4 in Settings
- Fixed notes preview scrollbar to match app-wide glass theme (Firefox)
- Fixed markdown checkbox interactivity — clicking now toggles checked state
- Fixed incomplete markdown rendering — all CommonMark syntax now supported

## Technical
- Added `marked` (markdown parser) and `dompurify` (HTML sanitizer) dependencies
- Added Web Crypto API-based encryption (PBKDF2 + AES-256-GCM)
- New storage key: `ott-notes-v2` for multi-note array (non-breaking; old `ott-notes` is separate)
- New file extension: `.ottdata` for encrypted backups

---

**Chrome Web Store:** [ZenBoard](https://chromewebstore.google.com/detail/ontracktab)
