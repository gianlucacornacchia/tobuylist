# Changelog

All notable changes to this project will be documented in this file.

## [2.5.0] - 2026-06-07

### Added
- **Add Item FAB**: The search input is now hidden by default. A floating orange "+" button (bottom-right) opens it. The input stays open after adding items so you can add multiple in a row. Tap the "X" button when done.

## [2.4.3] - 2026-06-07

### Changed
- **Menu Buttons**: Made "Sync Now" and "Settings" buttons equal width with matching labels.

## [2.4.2] - 2026-06-07

### Changed
- **UI Cleanup**: Moved "Sync Now" and "Sharing Settings" buttons from the header to the side menu for a cleaner header layout.

## [2.4.1] - 2026-06-07

### Changed
- **Version Display**: Moved version string from the header title to the bottom of the menu drawer.

## [2.4.0] - 2026-06-07

### Added
- **QR Code Scanner**: Scan a QR code with your device camera to automatically configure Supabase sync credentials. Available in the Sync Setup dialog when unconfigured.

## [2.3.1] - 2026-02-01

### Fixed
- **Scrolling Issue**: Fixed a bug where the shopping list was not scrollable on some devices due to CSS flexbox constraints (`min-h-0`). The "Add Item" bar now remains correctly fixed at the bottom while the list scrolls.

## [2.3.0] - 2026-01-31

### Added
- **Multiple Lists**: Users can now create and switch between multiple shopping lists.
- **List Sharing**: Share lists via a simple 6-character alphanumeric code.

### Fixed
- **Shared Lists**: Resolved "List not found" errors by enforcing proper RLS policies and handling missing Supabase credentials gracefully.
- **Connection Reliability**: Improved error handling in `joinList` and `createList` to provide specific feedback (e.g., "Invalid API Key") instead of silent failures.
- **Performance**: Optimized `joinList` to load in the background for instant UI response and added database index recommendations.

## [2.2.0] - 2026-01-31

### Added
- Human-readable versioning displayed in the app header (v2.2.0).
- Safe deployment script `scripts/deploy.ps1` that ensures all changes are committed and pushed before deploying.
- `npm run deploy:safe` script for convenient execution of the safe deployment process.
- Persistent agent instructions in `.agent/instructions.md`.

### Fixed
- Item reversion bug: Items no longer jump back to the "to buy" list after being marked as bought, thanks to incremental Supabase sync.
- Header text refinement: Removed "Realtime" suffix for a cleaner look.
