# Chrome Web Store Publishing Checklist

## Prepared Files

- Extension upload ZIP: `store-assets/OnTrackTab-1.0.2.zip`
- Store screenshots: `store-assets/screenshots/`
- Small promotional image: `store-assets/promo/small-promo-440x280.png`
- Extension icon: `public/icons/icon-128.png`
- Store description draft: `docs/description.md`
- Privacy policy draft: `docs/privacy-policy.md`

## Store Listing

Suggested category: `Productivity`

Suggested language: `English`

Single-line summary:

```text
A calm, customizable, local-first Chrome new tab dashboard with search, widgets, notes, weather, calendar, and wallpapers.
```

Detailed description:

Use the main copy from `docs/description.md`.

Screenshots:

Upload these five screenshots in order:

1. `store-assets/screenshots/01-home.png`
2. `store-assets/screenshots/02-bookmark-search.png`
3. `store-assets/screenshots/03-grid-layout-edit.png`
4. `store-assets/screenshots/04-background-settings.png`
5. `store-assets/screenshots/05-api-keys.png`

Promotional image:

- Small promo: `store-assets/promo/small-promo-440x280.png`

## Privacy Tab

Single purpose:

```text
OnTrackTab replaces Chrome's new tab page with a customizable, local-first productivity dashboard for search, widgets, notes, weather, calendar, frequently visited sites, and wallpapers.
```

Permission justifications:

```text
storage: Saves extension settings, widget preferences, layout choices, notes, liked wallpapers, cached weather, and cached wallpaper data locally.
```

```text
bookmarks: Enables bookmark-first search from the new tab page.
```

```text
history: Displays recently or frequently visited sites as a user-facing new tab widget.
```

```text
topSites: Provides a fallback source for the most-visited sites widget when detailed history data is unavailable.
```

Host permission justifications:

```text
https://api.tomorrow.io/*: Fetches live weather data when the user adds a Tomorrow.io API key.
```

```text
https://api.unsplash.com/*: Fetches Unsplash photo metadata when the user adds an Unsplash Access Key and selects Unsplash wallpapers.
```

```text
https://images.unsplash.com/*: Downloads selected Unsplash wallpaper images for display and local caching.
```

Remote code:

```text
No. OnTrackTab does not execute remotely hosted code. It only makes HTTPS API requests for optional weather and wallpaper data.
```

Recommended data disclosure:

```text
Web history / browsing activity is accessed locally to show the most-visited sites widget. User-provided API keys, settings, notes, and cached data are stored locally. OnTrackTab does not sell user data and does not transmit bookmark/history data to the developer.
```

Privacy policy:

Use a public URL for `docs/privacy-policy.md`, for example the GitHub file URL after this is pushed.

## Distribution

Suggested visibility for first submission:

```text
Public
```

Suggested payment:

```text
Free
```

Publishing mode:

For first release, consider unchecking automatic publishing at submit time so the item is staged after review. You can manually publish once review is approved.

## Final Submit Steps

1. Open the Chrome Developer Dashboard.
2. Click `Add new item`.
3. Upload `store-assets/OnTrackTab-1.0.2.zip`.
4. Complete Store Listing using `docs/description.md` and `store-assets/`.
5. Complete Privacy using the text above.
6. Complete Distribution.
7. Add test instructions if requested.
8. Submit for review.
