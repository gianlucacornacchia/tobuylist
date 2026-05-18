# ADR-007: Single Shared Supabase Project with QR Code Credential Sharing

**Status:** Accepted  
**Date:** 2026-01-31

---

## 1. Context

For real-time sync to work, all family members must connect to the **same** Supabase project. The Supabase connection requires two values: the Project URL and the Anon Key. These are long, complex strings that cannot be typed manually.

The sharing mechanism must:

- Transfer two credentials (URL + key) from one device to another
- Work for non-technical users (no copy-paste of 200-char strings)
- Not require any server infrastructure beyond Supabase itself
- Work when devices are physically co-located (typical family setup)

**Forces:**
- Supabase URL: ~40 characters (`https://abcdefghij.supabase.co`)
- Anon Key: ~200 characters (JWT format)
- Target users cannot be expected to copy-paste these correctly
- Physical co-location is the common sharing scenario (handing phone to partner)
- The app has no backend server to act as an intermediary

## 2. Decision

We will encode both credentials as **Base64 values in a URL** and display that URL as a **QR code** within the app. The receiving device scans the QR code, opens the URL, and the app auto-configures itself.

**URL format:** `https://gianlucacornacchia.github.io/tobuylist/#su=<base64_url>&sk=<base64_key>`

**Flow:**
1. Device A: Open Settings → "Share Config via QR Code" → displays QR
2. Device B: Scan QR with camera → opens URL in browser → app reads hash fragment → saves credentials → syncs

**Encoding:** `btoa()` / `atob()` for Base64, `encodeURIComponent()` for URL safety. Hash fragment (`#`) is used instead of query params (`?`) to survive iOS Add-to-Home-Screen (see ADR-001).

## 3. Consequences

**Positive:**
- One-scan setup — non-technical users can configure sync in seconds
- No typing required — eliminates human error in credential entry
- No server infrastructure — URL is self-contained, no redirect service needed
- Works offline for display — the QR code is generated client-side
- Backward compatible — URL can also be shared via messaging apps (copy link)

**Negative:**
- Credentials are embedded in a URL — could be inadvertently shared (bookmarks, browser history, messaging logs)
- No expiration — the QR code/URL works indefinitely unless the key is rotated
- Physical proximity required for QR scanning — cannot share remotely (but the URL can be texted)
- Base64-encoded JWT in a URL is long (~350 chars) — works fine as QR but ugly if displayed as text
- Single point of configuration — if the Supabase project is deleted, all devices lose sync

## 4. Alternatives Considered

### Alternative A: Manual copy-paste of credentials

- **Description:** User copies URL and key from Supabase dashboard, pastes into settings on each device
- **Advantage:** No QR code dependency, works remotely
- **Rejected because:** The anon key is 200+ characters. Non-technical users will fail. Error-prone. Terrible UX for the target audience (family members).

### Alternative B: Cloud-based pairing service

- **Description:** Device A uploads credentials to a temporary endpoint (e.g., Firebase short link), Device B fetches them via a short code
- **Advantage:** Works remotely without physical proximity, credentials aren't in the URL permanently
- **Rejected because:** Requires additional infrastructure (server/cloud function). Introduces a third-party dependency. Credentials would be stored (even temporarily) on an external server — unnecessary trust expansion.

### Alternative C: NFC / Bluetooth transfer

- **Description:** Tap phones together to transfer credentials via Web NFC or Web Bluetooth
- **Advantage:** Instant, no QR needed, very intuitive
- **Rejected because:** Web NFC is Chrome Android only (not iOS). Web Bluetooth has limited support and complex pairing flow. Not viable for cross-platform PWA.

### Alternative D: Shared clipboard / AirDrop

- **Description:** Copy credentials to clipboard, paste on other device via platform sharing
- **Advantage:** Uses native OS sharing capabilities
- **Rejected because:** Cross-platform incompatible (AirDrop is Apple only). Clipboard sharing between devices requires same ecosystem. Not a universal solution.

## 5. Compliance

- **Code review:** `Header.tsx` must generate share URL using hash fragment format (`#su=...&sk=...`)
- **Code review:** `App.tsx` must read credentials from hash on startup and configure Supabase
- **Security review:** Confirm that the anon key is indeed a public client key (not a service role key)
- **UX verification:** QR code must be large enough to scan reliably on mobile (≥200px)

## 6. Related ADRs

- `ADR-001: PWA Credential Sharing via Hash Fragment` — fixes the iOS Add-to-Home-Screen bug in this sharing flow
- `ADR-003: Anonymous Supabase Access` — the credentials being shared grant full anonymous access
- `ADR-002: Local-First Architecture` — credentials enable the optional sync layer
- `ADR-006: Share Code for List Collaboration` — after credentials are shared, users still need to join specific lists via share code
