# ToBuy - Shopping List

A modern, offline-capable grocery shopping list PWA built with React, TypeScript, and Vite, featuring realtime synchronization with Supabase.

## Features

- **Realtime Sync**: Collaborative shopping list with Supabase integration.
- **Smart Sorting**: Items are sorted based on your purchase history.
- **Autocomplete**: Quick item entry with suggestions.
- **PWA support**: Installable on mobile and works offline.
- **Human-Readable Versioning**: Visible version tracking (v2.2.0) in the app header.

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
The app version is managed in `package.json` and automatically injected into the UI via Vite's `define` configuration.

### Deployment Rule
Before deploying to GitHub Pages, always ensure all changes are committed and pushed to the remote repository to maintain a consistent state between the source code and the live app.
