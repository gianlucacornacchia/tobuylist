# Changelog

All notable changes to this project will be documented in this file.

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
