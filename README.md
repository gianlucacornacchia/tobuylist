# ToBuy - Shopping List

A modern, offline-capable grocery shopping list PWA built with React, TypeScript, and Vite, featuring realtime synchronization with Supabase.

## Features

- **Shared Lists**: Create and share multiple lists with friends and family using simple 6-character codes.
- **Multiple Lists Support**: Manage different lists for different occasions (e.g., Grocery, Party, Hardware).
- **Realtime Sync**: Collaborative shopping list with Supabase integration.
- **QR Code Setup**: Scan or generate QR codes to configure sync between devices — no manual credential entry needed.
- **Smart Sorting**: Items are sorted based on your purchase history.
- **Quantity & Units**: Track item quantities seamlessly (e.g. `2 Kg`). Adjust them inline via the touch-friendly interface.
- **Autocomplete & Parsing**: Quick item entry with suggestions. Smart parsing separates quantities from names (e.g., "2 Kg Apples").
- **Floating Add Button**: A clean FAB opens the add-item input on demand. Stays open for batch entry.
- **PWA support**: Installable on mobile and works offline.
- **Version Tracking**: Visible version number in the side menu.

## Scripts

### `npm run dev`
Starts the development server.

### `npm run build`
Builds the app for production.

### `npm run deploy`
Builds and deploys the app directly to GitHub Pages.

### `npm run deploy:safe`
**Recommendation for Deployment**. Runs the `scripts/deploy.ps1` PowerShell script which ensures:
1. All changes are committed.
2. All commits are pushed to the remote repository.
3. The app is then built and deployed to GitHub Pages.

## Development

### Versioning
The app version is managed in `package.json` and directly imported into the UI, ensuring immediate updates without restarting the development server.

### Deployment Rule
Before deploying to GitHub Pages, always ensure all changes are committed and pushed to the remote repository to maintain a consistent state between the source code and the live app.
