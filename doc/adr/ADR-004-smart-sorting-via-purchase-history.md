# ADR-004: Smart Sorting via Last-Bought Timestamp Rank

**Status:** Accepted  
**Date:** 2026-01-15

---

## 1. Context

Shoppers follow a habitual path through their store. If the list is sorted to match their walking route, they don't need to backtrack. The app needs a sorting mechanism that:

- Learns the user's store path automatically
- Requires zero manual configuration
- Improves over time with usage
- Works without store layout data (which is proprietary and unavailable)

**Forces:**
- Store layouts vary — no universal aisle database exists
- Users shop at multiple stores with different layouts
- Manual drag-and-drop reordering is tedious for 20+ item lists
- The system must work from day one (cold start) without training data
- Simplicity is paramount — the sorting logic must be explainable in one sentence

## 2. Decision

We will sort pending items by their **last-bought timestamp rank** — a value recorded each time an item is marked as bought. Items bought more recently get a higher rank (i.e., they appear lower in the list, matching the store path traversal order).

**Algorithm:**
1. When an item is toggled to "bought", record `Date.now()` as its rank in `itemRanks[itemName.toLowerCase()]`
2. When an item is added to the list, assign its rank from `itemRanks` (or fall back to `createdAt` for never-bought items)
3. Pending items are sorted by `order` (ascending) — lower rank = earlier in the path

**Key insight:** If you consistently buy bread before milk, bread's rank will always be lower than milk's rank. Over time, the list naturally reflects your store traversal order.

Additionally, `itemBuyCounts[itemName]` tracks purchase frequency to power autocomplete sorting (most-bought items appear first in suggestions).

## 3. Consequences

**Positive:**
- Zero configuration — works automatically from the first shopping trip
- Improves with every purchase — accuracy increases over time
- Simple implementation — just a timestamp per item name (~10 lines of logic)
- Works across stores (partially) — items bought in similar order at different stores converge
- Explainable — "items sort by when you last bought them"

**Negative:**
- Multi-store inaccuracy — if user shops at stores with very different layouts, the sort may not match either perfectly
- Cold start — first shopping trip has no ranking data, items sort by creation time
- One-dimensional — cannot express "I buy milk at the start at Store A but at the end at Store B"
- Rank is overwritten each purchase — no smoothing or averaging of historical positions
- Depends on consistent shopping habits — highly variable shopping patterns produce noisy rankings

## 4. Alternatives Considered

### Alternative A: Category-based sorting (aisle groups)

- **Description:** Assign items to categories (produce, dairy, frozen) and sort by category order
- **Advantage:** Predictable grouping, works without purchase history
- **Rejected because:** Requires maintaining a category database, manual category assignment for new items, and per-store category ordering. Over-engineered for a family app.

### Alternative B: Manual drag-and-drop only

- **Description:** Users manually reorder items each time
- **Advantage:** Full user control, no algorithm to debug
- **Rejected because:** Tedious for lists with 15+ items. Users forget optimal order between trips. Doesn't scale.

### Alternative C: Weighted moving average of positions

- **Description:** Track the average position (index in the list when bought) over multiple trips, smoothing noise
- **Advantage:** More stable ranking, resistant to one-off order changes
- **Rejected because:** Significantly more complex (need to store position history). The simpler timestamp approach works well enough for weekly shopping patterns. Can be upgraded to this later if needed.

## 5. Compliance

- **Code review:** `store.ts` — `toggleItem` must update `itemRanks` with `Date.now()` when `isNowBought === true`
- **Code review:** `addItem` must read from `itemRanks` when assigning the `order` field
- **Behavioral test:** Add items A, B, C. Buy in order C → B → A. Re-add all three. Verify sort order is C, B, A (matching the last purchase sequence)

## 6. Related ADRs

- `ADR-002: Local-First Architecture` — ranks are stored locally in Zustand persist (not synced to Supabase)
- `ADR-005: Geolocation Store Detection` — future enhancement could maintain per-store rankings
