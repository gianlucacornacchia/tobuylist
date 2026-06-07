---
description: "Use when deploying, implementing new features, fixing bugs, or making any code changes. Enforces version bumping, documentation updates, and changelog maintenance."
applyTo: "**"
---

# Workflow Rules

## Version Bumping (Before Deploy)

Before any deploy (`npm run deploy` or `npm run deploy:safe`):
- Increment the `version` field in `package.json` following semver:
  - Patch (x.y.Z) for bug fixes
  - Minor (x.Y.0) for new features
  - Major (X.0.0) for breaking changes

## Documentation Updates

After every code change (feature, fix, or refactor):
1. Review and update all relevant docs in `doc/` to reflect the change
2. Check these files for accuracy:
   - `doc/features.md` — feature list
   - `doc/IMPLEMENTATION.md` — technical details
   - `doc/USER_STORIES.md` — user-facing stories
   - `doc/store-selection-features.md` — store-related features
   - `doc/README.md` — general project docs
   - `README.md` — root readme
3. Update or create ADRs in `doc/adr/` if architectural decisions were made

## Changelog

After every bug fix or new implementation, append an entry to `CHANGELOG.md`:
- Use the format `## [version] - YYYY-MM-DD`
- Group changes under `### Added`, `### Fixed`, `### Changed`, or `### Removed`
- Write a brief, user-facing description of the change
- Place the new entry at the top (below the header)
