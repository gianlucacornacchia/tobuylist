# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-01-31

### Added
- Human-readable versioning displayed in the app header (v2.2.0).
- Safe deployment script `scripts/deploy.ps1` that ensures all changes are committed and pushed before deploying.
- `npm run deploy:safe` script for convenient execution of the safe deployment process.
- Persistent agent instructions in `.agent/instructions.md`.

### Fixed
- Item reversion bug: Items no longer jump back to the "to buy" list after being marked as bought, thanks to incremental Supabase sync.
- Header text refinement: Removed "Realtime" suffix for a cleaner look.
