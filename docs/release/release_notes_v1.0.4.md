# OnTrackTab v1.0.4 Release Notes

## What Changed

This release fixes a storage quota error that prevented users from saving more than two liked wallpapers.

Liked wallpapers are stored as full-resolution image data, which can run several megabytes per wallpaper. Chrome's default `chrome.storage.local` quota is 10 MB, so the third like (and any subsequent ones) failed with `Resource::kQuotaBytes quota exceeded`, and importing a backup of liked wallpapers hit the same limit. The extension now requests the `unlimitedStorage` permission, which removes Chrome's storage cap so liked wallpapers, settings, and notes can grow as needed.

## Included Fixes

- Added the `unlimitedStorage` permission so liking or importing more than two wallpapers no longer fails with a quota error.

## Chrome Web Store Description Note

v1.0.4 fixes a storage quota error that blocked users from liking or importing more than two wallpapers.

Chrome Web Store: https://chromewebstore.google.com/detail/cgiddhbgjejidplekmmegebfgoikkdil?utm_source=item-share-cb

## Update Package

- Chrome extension ZIP: `store-assets/OnTrackTab-1.0.4.zip`
- Manifest version: `1.0.4`

## Verification

- Ran `npm run build` successfully.
- Confirmed `dist/manifest.json` includes `unlimitedStorage` in `permissions`.
