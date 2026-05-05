# OnTrackTab v1.0.2 Release Notes

## What Changed

This update fixes a storage issue that could happen when OnTrackTab was open in more than one tab.

Before this release, one older tab could still have outdated saved data in memory. If that tab was refreshed later, it could overwrite newer changes from another tab. This could make liked Unsplash wallpapers, notes, or settings look like they disappeared.

In v1.0.2, saved app data now uses Chrome extension storage and listens for changes from other open tabs. When you like a wallpaper, edit notes, or change settings in one tab, the other open OnTrackTab tabs can stay in sync instead of writing old data back.

## Included Fixes

- Liked wallpapers now persist correctly across multiple open extension tabs.
- Notes now use Chrome extension storage instead of direct browser local storage.
- Settings and layout tweaks sync through extension storage.
- Weather cache now uses extension storage for more consistent behavior.
- Existing saved data is copied forward automatically so users do not need to set things up again.
- A storage fallback bug was fixed so saved empty values are not mistaken for missing data.

## Update Package

- Chrome extension ZIP: `store-assets/OnTrackTab-1.0.2.zip`
- Manifest version: `1.0.2`

## Verification

- Ran `npm run build` successfully.
- Confirmed direct app storage usage now goes through the extension storage path.
