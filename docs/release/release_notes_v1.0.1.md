# OnTrackTab v1.0.1 Release Notes

## Highlights

- Unsplash query edits no longer trigger wallpaper refreshes on every keystroke.
- Invalid Unsplash access keys are auto-tried once, then left for the user to retry with the refresh button.
- Error and save feedback now appears as toast messages across the app.
- Unsplash wallpaper refresh now shows a loading state while fetching.
- Liked wallpapers can be exported and imported from Settings.
- Imported liked wallpapers are deduplicated with a stable hash before being added.

## Update Package

- Chrome extension ZIP: `store-assets/OnTrackTab-1.0.1.zip`
- Manifest version: `1.0.1`

## Verification

- Ran `npm run build` successfully.
- Confirmed the v1.0.1 ZIP contains the built extension files and updated manifest.
