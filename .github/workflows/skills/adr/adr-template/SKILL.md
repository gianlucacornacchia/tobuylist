---
name: adr-template
description: Template for writing ADRs (Architectural Decision Records). Use when
  writing, creating, or drafting an ADR document for architecture decisions,
  technology choices, or design trade-offs.
disable-model-invocation: false
user-invocable: false
---

# ADR Template

Use this template when writing any Architectural Decision Record.

## Required Sections

Every ADR must include all six sections below. Do not omit any section.

### 1. Context

Describe the background, constraints, and forces driving this decision:
- What technical problem are we solving?
- What constraints exist (hardware, memory, real-time, safety)?
- What has changed to make this decision necessary now?
- What stakeholders are affected?

### 2. Decision

State clearly what was decided:
- What approach, technology, or pattern was chosen?
- Why was this option selected over the alternatives?
- What are the key arguments in favor?

Use definitive language: "We will use...", "The module shall...", "We decided to..."

### 3. Consequences

List both positive and negative impacts explicitly:

**Positive:**
- Performance gains
- Simplified architecture
- Better testability
- Reduced coupling

**Negative:**
- Added complexity in specific areas
- Learning curve
- Migration effort
- Potential limitations

### 4. Alternatives Considered

For each alternative evaluated:
- Name and brief description
- Key advantages
- Reasons for rejection
- Under what conditions it might be reconsidered

Minimum two alternatives per ADR.

### 5. Compliance

How will adherence to this decision be verified?

Prefer automated mechanisms:
- CI/CD checks (static analysis rules, build flags)
- Code review checklist items
- Automated test coverage requirements
- Architecture fitness functions

If automation is not possible, specify the manual verification process.

### 6. Related ADRs

Cross-reference:
- ADRs that this decision depends on
- ADRs that depend on this decision
- ADRs that this decision supersedes

Use format: `ADR-NNN: [Title] — [relationship]`

## File Naming

```
docs/adr/
  ADR-001-title-with-dashes.md
  ADR-002-title-with-dashes.md
```

## Status

Each ADR must have a status in the header:
- **Proposed** — under discussion
- **Accepted** — decision made, in effect
- **Deprecated** — superseded by another ADR
- **Superseded** — replaced by ADR-NNN
