# OnTrackTab v1.0.3 Release Notes

## What Changed

This release focuses on layout fit and faster search access across more screen sizes.

Floating and bento layouts now have magnification controls in Tweaks. Users can zoom the dashboard out or in with `-` and `+` buttons, with the current magnification value shown between them. This gives users a Chrome-like zoom adjustment for the new tab dashboard when a screen size or display scaling makes widgets feel cramped.

Widgets in floating and bento layouts can now be configured as small, medium, large, or XL from the Widgets settings section. Visibility toggles stay in the same place, and size controls sit beside each widget so users can tune the dashboard without switching to grid edit mode.

Unsplash background setup is clearer now: if Unsplash is selected but no Access Key is saved, the Background section shows a warning before users wonder why photos are not loading.

Search also gets a faster path. `/` still focuses bookmark search, and `.` now focuses the selected search engine directly, using the engine chosen in Search settings.

Grid layout editing is tighter in this release too. Widgets can now be moved closer to the top of the grid, and search results inside the grid search widget open as a floating glass dropdown instead of being cropped inside the widget card.

## Included Fixes

- Added magnification controls under Settings → Tweaks.
- Added small, medium, large, and XL widget size controls under Settings → Widgets.
- Improved floating and bento layout behavior on narrow or short screens to reduce widget overlap.
- Added a missing-key warning when Unsplash is selected without an Unsplash Access Key.
- Connected search fallback and direct engine mode to the selected engine instead of always using Google.
- Added `.` as a keyboard shortcut for direct selected-engine search.
- Reduced the grid layout top gap so widgets can be placed near the top of the grid.
- Fixed grid search results being cropped inside the search widget card.
- Updated scrollbars in search results, notes, most visited, and settings to match the glass UI with accent-colored styling.

## Chrome Web Store Description Note

v1.0.3 adds better layout controls for more screen sizes: adjust dashboard magnification, size individual widgets in floating and bento layouts, and jump directly into your selected search engine with the `.` shortcut. Grid search results now open cleanly outside the widget card, and Unsplash setup is clearer with an inline warning when an Access Key is missing.

Chrome Web Store: https://chromewebstore.google.com/detail/cgiddhbgjejidplekmmegebfgoikkdil?utm_source=item-share-cb

## Update Package

- Chrome extension ZIP: `store-assets/OnTrackTab-1.0.3.zip`
- Manifest version: `1.0.3`

## Verification

- Ran `npm run build` successfully.
