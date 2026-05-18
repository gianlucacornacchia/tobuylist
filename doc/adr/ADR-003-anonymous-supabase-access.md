# ADR-003: Anonymous Supabase Access (No User Authentication)

**Status:** Accepted  
**Date:** 2026-01-31

---

## 1. Context

The ToBuy List app uses Supabase as an optional sync backend for real-time family collaboration. The typical user is a non-technical family member who wants to share a shopping list instantly — without creating accounts, verifying emails, or managing passwords.

**Forces:**
- Target users are non-technical (parents, partners, children) — any friction loses them
- The app must work immediately after scanning a QR code
- Supabase requires either authenticated access (JWT) or anonymous access (anon key)
- The data being synced (grocery items) is low-sensitivity — not financial, medical, or personal
- Row Level Security (RLS) policies must be configured for Supabase to function
- Each family typically uses their own Supabase project (self-provisioned or shared via QR)

## 2. Decision

We will use **Supabase anonymous access** with fully open RLS policies. There is no user authentication system.

**Implementation:**
- Each family/group provisions their own Supabase project (free tier)
- The anon key grants full read/write access to `items` and `lists` tables
- RLS is enabled but policies use `USING (true)` / `WITH CHECK (true)` (allow all)
- The anon key is shared between family members via QR code (ADR-007)
- Security boundary is the **Supabase project itself** — if you have the key, you have full access

**Rationale:** The anon key acts as a shared family secret. Since each family has their own Supabase project, exposure only affects that family's grocery data.

## 3. Consequences

**Positive:**
- Zero-friction onboarding — scan QR, start shopping
- No password management, no "forgot password" flows, no email verification
- No user table, no sessions, no token refresh logic — dramatically simpler codebase
- Works immediately for all family members without invitations or approvals
- Free-tier Supabase is sufficient for typical family use

**Negative:**
- Anyone with the anon key has full access — no per-user permissions
- No audit trail of who added/deleted items
- If the anon key leaks (e.g., URL shared publicly), strangers could vandalize the list
- Cannot implement features like "only I can delete items" or user-specific views
- No rate limiting per user — a malicious actor with the key could spam the database

## 4. Alternatives Considered

### Alternative A: Supabase Auth (email/password or magic link)

- **Description:** Each user creates a Supabase account; RLS policies restrict access per user
- **Advantage:** Per-user permissions, audit trail, revocable access
- **Rejected because:** Adds significant friction. A shopping list shared between partners should not require both to create accounts and verify emails. The overhead far exceeds the security needs of grocery data.

### Alternative B: Supabase Auth with anonymous sign-in

- **Description:** Use Supabase's anonymous auth to generate a temporary user identity
- **Advantage:** Some per-device tracking without requiring real credentials
- **Rejected because:** Anonymous users are ephemeral — identity is lost on device wipe or new browser. Adds complexity (token refresh, session management) without meaningful security gain for a family app.

### Alternative C: Custom shared secret / API key

- **Description:** Generate a custom secret per list that acts as a bearer token, validated by a server function
- **Advantage:** Could be rotated without re-provisioning the entire Supabase project
- **Rejected because:** Requires server-side functions (Edge Functions or middleware), adding infrastructure complexity. The anon key already serves this purpose adequately.

## 5. Compliance

- **Verified by:** `fix_rls.sql` — RLS policies are explicitly open (`USING (true)`)
- **Documented risk:** The anon key is a shared secret. If a family suspects their key is compromised, they should rotate it in the Supabase dashboard and re-share via QR
- **Scope limitation:** This decision is acceptable only for low-sensitivity data (shopping lists). If the app ever stores personal, financial, or health data, this must be revisited

## 6. Related ADRs

- `ADR-002: Local-First Architecture` — this decision depends on (sync is optional layer)
- `ADR-007: Credential Sharing via QR` — mechanism for distributing the anon key
- `ADR-006: Share Code for List Collaboration` — list-level sharing within the same project
