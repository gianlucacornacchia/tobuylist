# ADR-006: 6-Character Share Code for List Collaboration

**Status:** Accepted  
**Date:** 2026-01-31

---

## 1. Context

Families need to collaborate on the same shopping list. The sharing mechanism must be:

- Instantly usable — no waiting for invitations or approvals
- Communicable verbally — "the code is ABC123" over a phone call
- Short enough to type manually on a phone keyboard
- Work without requiring the recipient to have any prior setup beyond Supabase credentials

**Forces:**
- Users share lists with 2-5 family members (small group)
- Sharing happens infrequently (once per list creation)
- The code must be human-readable and typeable (no UUIDs)
- No server-side invitation system exists (no email, no push notifications)
- Collision probability must be negligible for the expected number of lists

## 2. Decision

Each list is assigned a **6-character uppercase alphanumeric share code** generated at creation time. To join a list, a user enters this code, and the app fetches the list metadata from Supabase by matching `share_code`.

**Implementation:**
- Code generated via `Math.random().toString(36).substring(2, 8).toUpperCase()`
- Stored in the `lists` table with a `UNIQUE` constraint on `share_code`
- `joinList(shareCode)` queries Supabase: `SELECT * FROM lists WHERE share_code = ?`
- On success, the list is added to the user's local state and becomes the active list
- The share code is displayed next to each list with a copy-to-clipboard button

**Code space:** 36^6 = ~2.18 billion possible codes. With expected usage of <1000 lists per project, collision probability is negligible.

## 3. Consequences

**Positive:**
- Extremely simple UX — type 6 characters to join
- Verbally communicable — works over phone calls, text messages, sticky notes
- No server-side invitation logic — just a database lookup
- Instant — no approval workflow, no waiting
- Works offline for display (code is stored locally) — only needs network for the join operation

**Negative:**
- No access control — anyone with the code can join (acceptable for family use)
- No revocation — once shared, the code cannot be invalidated without deleting the list
- No membership tracking — the app doesn't know who has joined a list
- Brute-force risk — 6 chars is short enough that an attacker could enumerate codes (mitigated by Supabase rate limiting and the fact that each project is isolated)
- Code uniqueness relies on `UNIQUE` DB constraint — collision during generation would cause a create failure (extremely unlikely)

## 4. Alternatives Considered

### Alternative A: UUID-based invite links

- **Description:** Generate a full URL with a UUID, share via link/QR
- **Advantage:** Effectively impossible to guess, can encode metadata in the URL
- **Rejected because:** Cannot be communicated verbally. Requires the user to share a link (not always convenient). For a 6-person family, typing "ABC123" is faster than sharing a URL.

### Alternative B: Email-based invitations

- **Description:** Enter a family member's email → send an invitation → they accept
- **Advantage:** Familiar pattern, creates a membership record, revocable
- **Rejected because:** Requires user accounts (conflicts with ADR-003), requires an email service, adds significant latency to the sharing flow. Over-engineered for a family grocery app.

### Alternative C: Real-time pairing (device proximity)

- **Description:** Two phones in proximity exchange list info via WebRTC or shared screen code
- **Advantage:** Doesn't require the code to persist
- **Rejected because:** Complex to implement, requires both devices to be present simultaneously. The share code approach lets you share asynchronously (e.g., text the code while at work).

## 5. Compliance

- **Database:** `share_code` column has `UNIQUE` constraint — verified in `migration.sql`
- **Code review:** `createList()` must generate a code and store it in both local state and Supabase
- **UX verification:** Share code must be visible next to each list in the menu with a copy button
- **Edge case:** If Supabase insert fails due to duplicate code, the list is still created locally (degraded mode)

## 6. Related ADRs

- `ADR-003: Anonymous Supabase Access` — share codes work without authentication
- `ADR-002: Local-First Architecture` — lists exist locally even without sync
- `ADR-007: Credential Sharing via QR` — prerequisite: recipient must have Supabase credentials before they can join a list
