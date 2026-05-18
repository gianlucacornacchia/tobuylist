# ADR-001: PWA Credential Sharing via URL Hash Fragment

**Status:** Accepted  
**Date:** 2026-05-17

---

## 1. Context

The ToBuy List app uses Supabase for real-time sync across devices. To onboard a new device, the app generates a QR code containing the Supabase project URL and anon key encoded in the share URL. When scanned, the receiving device opens the app in Safari (or any mobile browser), reads the credentials from the URL, and stores them in `localStorage` via Zustand's `persist` middleware.

**Problem discovered:** On iOS, when a user scans the QR code in Safari and then taps "Add to Home Screen" to install the PWA, all credentials are lost. The PWA launches in a completely separate browsing context with its own `localStorage` partition — it cannot access the data stored by Safari's regular tabs.

**Root cause chain:**
1. QR code encodes URL: `https://…/tobuylist/?su=<base64>&sk=<base64>`
2. Safari opens the URL → `App.tsx` reads query params → saves to localStorage → **clears the URL**
3. User taps "Add to Home Screen" → iOS bookmarks the manifest's `start_url` (`/tobuylist/`) — no credentials in the URL
4. PWA opens with empty localStorage and no URL params → credentials gone

**Forces:**
- iOS Safari gives PWAs (standalone mode) a separate storage partition from browser tabs
- iOS Safari **strips query parameters** from the URL when creating a home-screen bookmark if they don't match the manifest `start_url`
- iOS Safari **preserves hash fragments** when bookmarking to the home screen
- The Supabase anon key is a public client-side key (not a secret), so including it in a URL is acceptable
- Existing QR codes in the wild use the `?su=…&sk=…` format and must continue to work

## 2. Decision

We will encode Supabase credentials in the **URL hash fragment** (`#su=…&sk=…`) instead of query parameters (`?su=…&sk=…`).

The credential-reading logic in `App.tsx` will:
1. Read from `window.location.hash` first (new format)
2. Fall back to `window.location.search` (backward compatibility)
3. **Not** clear the hash from the URL on iOS — it must survive until the user completes "Add to Home Screen"
4. Clear query params only when old format is used

Additionally, on iOS Safari (non-standalone), when credentials are loaded from a hash-fragment URL, the app displays a dismissible banner: *"Tip: Tap the Share button then 'Add to Home Screen' for the best experience."* This guides the user to install the PWA while the credentials are still baked into the URL.

**Key argument:** Hash fragments are the only URL component that iOS Safari reliably preserves when transitioning from browser → PWA standalone mode. This requires minimal code changes and maintains full backward compatibility.

## 3. Consequences

**Positive:**
- Credentials survive the iOS "Add to Home Screen" flow — the PWA opens with the hash, re-reads it, and self-configures
- Zero breaking changes for existing users — old `?su=…&sk=…` links continue to work via fallback
- No server-side changes required — hash fragments are never sent to the server
- Minimal code footprint — ~40 lines changed across 2 files
- The install banner educates users about the optimal installation flow

**Negative:**
- Hash fragments are visible in the URL (though not in mobile Safari's address bar)
- If a user manually shares the URL (e.g., copy-paste), the credentials travel with it — this is acceptable since the anon key is public, but could confuse users
- The hash is never cleared on iOS, so if the user opens the URL in a desktop browser it remains in the address bar (cosmetic concern only)
- Detection of "iOS Safari non-standalone" relies on user-agent sniffing (`/iPad|iPhone|iPod/`) which could break if Apple changes UA strings

## 4. Alternatives Considered

### Alternative A: Keep query params + instruct user not to clear URL

- **Description:** Keep `?su=…&sk=…` but don't call `replaceState` to clear the URL, hoping iOS preserves it
- **Advantage:** No format change for the share URL
- **Rejected because:** iOS Safari explicitly strips query params that don't match the manifest `start_url` when adding to home screen. This approach simply does not work on iOS.

### Alternative B: Use a service worker to intercept and store credentials

- **Description:** Register a service worker that caches credentials in IndexedDB (shared between browser and PWA on newer iOS versions)
- **Advantage:** Would work even if the URL is cleared, since IndexedDB is sometimes shared
- **Rejected because:** iOS sharing of IndexedDB between Safari tabs and standalone PWAs is unreliable (varies by iOS version). Adds significant complexity. Not a guaranteed fix.

### Alternative C: Server-side session / magic link

- **Description:** Generate a one-time token server-side, send user to a redirect endpoint that sets a cookie
- **Advantage:** Most robust — cookies can sometimes be shared
- **Rejected because:** Requires a server-side component the project doesn't have. Over-engineered for the current scope. The anon key is not a secret, so server-side token exchange adds no security benefit.

## 5. Compliance

- **Manual verification:** Scan the QR code on an iOS device, confirm credentials load, then "Add to Home Screen" and verify the PWA retains credentials on reopen
- **CI check:** TypeScript compilation (`tsc --noEmit`) passes — already verified
- **Regression guard:** Old-format URLs (`?su=…&sk=…`) must continue to work — testable by opening such a URL and confirming credentials load

## 6. Related ADRs

- None (first ADR in this project)

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/Header.tsx` | `shareUrl` uses `#` instead of `?` |
| `src/App.tsx` | Credential reading from hash (primary) + query params (fallback); iOS install banner |
