---
name: adr-best-practices
description: Best practices, quality checklist, and anti-patterns for ADRs
  (Architectural Decision Records). Use when writing, reviewing, or evaluating
  an ADR for completeness and clarity.
disable-model-invocation: false
user-invocable: false
---

# ADR Best Practices

## Writing Tips

- **Be specific.** "We chose FreeRTOS" is not enough. State why it was chosen over Zephyr, ThreadX, and bare-metal, given the project's constraints.
- **State trade-offs honestly.** Every decision has downsides. Documenting them shows engineering maturity and helps future teams understand the reasoning.
- **Write for the reader who joins in 6 months.** They were not in the meeting. The ADR is their only context.
- **Keep it concise.** Target 1-2 pages. If it exceeds 3 pages, the decision may need to be split.
- **Use concrete numbers.** "Better performance" → "Reduces ISR latency from 45μs to 12μs." "Uses less memory" → "Saves 2.4KB RAM per instance."

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Missing alternatives | Looks like the first idea was picked without evaluation | Always document at least 2 alternatives |
| No consequences | Future team cannot assess if the decision still holds | List positive AND negative impacts |
| Vague compliance | "We'll review it" is not verifiable | Specify a concrete check (CI rule, test, lint) |
| Decision without context | Reader cannot understand why | Explain the forces and constraints first |
| Overly long | Nobody reads it | Keep under 2 pages, split if needed |
| No date or status | Cannot track decision lifecycle | Always include date and status header |

## Embedded-Specific Considerations

When writing ADRs for embedded systems, address:

- **Memory impact** — RAM and ROM cost of the decision
- **Real-time impact** — worst-case execution time, interrupt latency
- **Portability** — does this tie us to a specific MCU vendor or toolchain?
- **Safety implications** — impact on MISRA compliance, functional safety
- **Power consumption** — does this affect sleep modes or duty cycling?
- **Testability** — can the code be tested on a host machine?

## Checklist Before Finalizing

- [ ] Context explains WHY the decision is needed
- [ ] Decision statement is clear and unambiguous
- [ ] At least 2 alternatives are documented with rejection reasons
- [ ] Both positive and negative consequences are listed
- [ ] Compliance mechanism is specified (preferably automated)
- [ ] Related ADRs are cross-referenced
- [ ] Status and date are in the header
- [ ] Memory and performance impact are quantified (for embedded)
- [ ] A team member who was NOT in the discussion can understand the ADR

## Directory Organization

For projects with multiple subsystems:

```
docs/adr/
  firmware/
    ADR-001-rtos-selection.md
    ADR-002-hal-abstraction-pattern.md
  communication/
    ADR-010-protocol-buffer-format.md
  testing/
    ADR-020-test-framework-selection.md
```

For smaller projects, a flat directory is sufficient:

```
docs/adr/
  ADR-001-state-machine-design.md
  ADR-002-configuration-strategy.md
```
