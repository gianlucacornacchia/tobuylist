# ADR-002: Local-First Architecture with Optional Supabase Sync

**Status:** Accepted  
**Date:** 2026-01-31

---

## 1. Context

The ToBuy List app is designed for grocery shopping — an activity that often happens in supermarkets with poor or no cellular connectivity. Users must be able to add, check off, and reorder items without any network dependency.

At the same time, families want to collaborate on a shared shopping list in real time (e.g., one person adds items at home while the other is already at the store).

**Forces:**
- Supermarkets often have dead zones with no data connectivity
- The app must be instantly responsive — no loading spinners for basic CRUD
- Family collaboration requires data to eventually reach all devices
- Users should not be forced to create accounts or configure a backend
- Conflict resolution must be simple and predictable

## 2. Decision

We will use a **local-first** architecture where Zustand with the `persist` middleware (backed by `localStorage`) is the **single source of truth**. Supabase sync is entirely optional and layered on top.

**Data flow:**
- All mutations (add, toggle, delete, reorder) apply immediately to local state
- If Supabase is configured, mutations are **pushed** asynchronously after local state is updated
- On app startup (or manual sync), a **pull** fetches the remote state and merges it into local
- Real-time updates arrive via Supabase Postgres Changes and are merged into local state
- **Last-write-wins** conflict resolution at the item level

**Key principle:** The app is fully functional with zero network — Supabase adds collaboration but is never required.

## 3. Consequences

**Positive:**
- App works perfectly offline — zero dependency on network for core functionality
- Instant UI response — no waiting for server round-trips
- Zero onboarding friction — app works out of the box without any configuration
- Simple mental model — local state is always authoritative
- Graceful degradation — sync failures are non-fatal

**Negative:**
- Last-write-wins can silently overwrite concurrent edits from another device
- No server-side validation — invalid data can propagate if a client has bugs
- Local storage has size limits (~5-10MB) — not an issue for shopping lists but limits scalability
- Deleted items can "resurrect" if another device pushes stale state before pulling
- No audit trail or undo for synced changes

## 4. Alternatives Considered

### Alternative A: Server-First (Supabase as source of truth)

- **Description:** All mutations go to Supabase first, local state is a cache
- **Advantage:** Single source of truth, no conflicts, simpler sync logic
- **Rejected because:** Completely unusable offline. A shopping list app that doesn't work in a supermarket is fundamentally broken. Would require mandatory account setup.

### Alternative B: CRDTs (Conflict-free Replicated Data Types)

- **Description:** Use a CRDT library (e.g., Yjs, Automerge) for automatic conflict-free merging
- **Advantage:** No data loss from concurrent edits, mathematically guaranteed convergence
- **Rejected because:** Over-engineered for a shopping list. Adds significant bundle size and complexity. The data model (a flat list of items with boolean states) rarely has true conflicts — last-write-wins is acceptable.

### Alternative C: Hybrid with operation log

- **Description:** Store a log of operations (add, delete, toggle) and replay them for sync
- **Advantage:** More precise conflict resolution, supports undo
- **Rejected because:** Significantly more complex to implement and debug. Operation logs grow unbounded without compaction. Not justified for the simplicity of the current data model.

## 5. Compliance

- **Automated:** Zustand persist middleware is configured with `name: 'tobuy-storage'` — verifiable by checking localStorage in browser DevTools
- **Architectural:** All store actions (addItem, toggleItem, deleteItem) modify local state synchronously via `set()`, then call `pushLocalChanges()` asynchronously — verified by code review
- **Testing:** App must remain fully functional with Supabase credentials cleared (empty `supabaseUrl`)

## 6. Related ADRs

- `ADR-003: Anonymous Supabase Access` — depends on this (sync layer has no auth)
- `ADR-007: Credential Sharing via QR` — depends on this (sharing the sync configuration)
- `ADR-001: PWA Credential Sharing via Hash Fragment` — addresses a specific bug in the sync setup flow
