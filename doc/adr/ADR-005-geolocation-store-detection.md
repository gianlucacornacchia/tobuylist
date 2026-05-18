# ADR-005: Geolocation-Based Store Detection (Haversine + Radius)

**Status:** Accepted  
**Date:** 2026-01-20

---

## 1. Context

The app tracks which store the user is currently shopping at, enabling future features like per-store item sorting and visit statistics. The detection must:

- Work automatically without user interaction
- Function on any modern mobile browser (no native app required)
- Not require hardware infrastructure (beacons, NFC tags)
- Be reasonably battery-efficient
- Handle ambiguity when stores are close together (e.g., shopping malls)

**Forces:**
- Web Geolocation API is the only positioning API available in a PWA
- GPS accuracy in urban environments is typically 5-20 meters
- Indoor positioning (WiFi fingerprinting) is not available via web APIs
- Battery drain from continuous GPS is a user concern
- Stores can be adjacent (mall food court) or overlapping (multi-floor)

## 2. Decision

We will use the **browser Geolocation API** in watch mode with the **Haversine formula** to calculate distance from the user's position to each saved store's coordinates. A store is detected when the user is within its configurable radius.

**Implementation:**
- `useGeolocation` hook uses `navigator.geolocation.watchPosition()` with `enableHighAccuracy: false`, `timeout: 10000ms`, `maximumAge: 60000ms`
- `findClosestStore()` calculates Haversine distance to each store and returns the closest one within its radius
- Each store has a user-configurable `radius` (50-500m, step 10m, default 100m)
- **Disambiguation:** If multiple stores are within their respective radii, a bottom-sheet dialog asks the user to choose
- Store coordinates are captured at creation time from the user's current GPS position

## 3. Consequences

**Positive:**
- Works on any device with GPS — no hardware dependencies
- Zero infrastructure cost — no beacons, no server-side geofencing
- User-configurable radius per store — adapts to different store sizes
- Battery-optimized — low accuracy mode with 1-minute position cache
- Disambiguation dialog handles edge cases gracefully

**Negative:**
- GPS is unreliable indoors — may lose fix inside large stores
- Urban canyon effect — tall buildings can degrade accuracy significantly
- Cannot distinguish floors (multi-level mall)
- 1-minute cache means detection can lag up to 60 seconds
- Low accuracy mode can have 100m+ error — problematic for closely-spaced stores
- Continuous watch still has battery impact on older devices

## 4. Alternatives Considered

### Alternative A: Geofencing API (native)

- **Description:** Use native OS geofencing (available on Android/iOS native apps)
- **Advantage:** OS-managed, battery-efficient, triggers in background
- **Rejected because:** Not available in web/PWA context. Would require a native wrapper (Capacitor, React Native), fundamentally changing the project's architecture.

### Alternative B: WiFi/Bluetooth beacon proximity

- **Description:** Deploy BLE beacons at store entrances, detect via Web Bluetooth API
- **Advantage:** Very precise indoor positioning, floor-aware
- **Rejected because:** Requires physical hardware at each store. Web Bluetooth has limited browser support. Completely impractical for a personal family app.

### Alternative C: Manual store selection only

- **Description:** User taps to select their current store, no automatic detection
- **Advantage:** Zero battery drain, zero false positives, works everywhere
- **Rejected because:** Adds friction on every shopping trip. Users forget to select. The automatic detection (even if imperfect) significantly improves UX for the 80% case where GPS works fine.

## 5. Compliance

- **Code review:** `useGeolocation.ts` must use `enableHighAccuracy: false` and `maximumAge: 60000`
- **Code review:** `findClosestStore()` must only return a store if distance ≤ store.radius
- **UX verification:** When 2+ stores are in range, a disambiguation dialog must appear (not auto-select arbitrarily)
- **Battery check:** Monitor battery impact on iOS Safari — if excessive, increase `maximumAge`

## 6. Related ADRs

- `ADR-004: Smart Sorting` — future per-store sorting depends on knowing which store the user is at
- `ADR-002: Local-First Architecture` — store data and visits are persisted locally
