# Stage 2: Detailed Plan

**Goal:** Produce a plan so detailed that execution is mechanical.

**Who:** Engineer (agent drafts, human refines)

**Previous:** [Stage 1: Investigate & Define](stage-1-investigate.md) | **Next:** [Stage 3: Plan Review](stage-3-plan-review.md)

---

This is the most important stage. Invest time here. A 30-minute plan saves hours of rework.

**Agent's role:**
- Read all affected code to understand current state
- Challenge scope before proposing solutions
- Draft the full plan based on the Problem Brief
- Propose specific changes at the file and function level
- Identify edge cases, error paths, and failure modes
- Search for prior patterns in codebase to maintain consistency

**Human's role:**
- Challenge every assumption in the plan
- Add domain knowledge the agent cannot infer
- Ensure the plan handles known pitfalls from past experience (see [Experience Library](experience-library.md))
- Decide between alternative approaches
- Verify the plan is complete enough for mechanical execution

---

## Step 0: Scope Challenge

Before writing any plan, the agent must answer these questions:

### What already exists?

Search the codebase for code that already partially or fully solves the problem. Can we reuse existing flows, capture outputs from existing code, or extend what is already there? List findings explicitly — this becomes the "What already exists" section of the plan.

### What is the minimum change?

What is the smallest set of changes that achieves the goal stated in the Problem Brief? Flag anything that could be deferred without blocking the core objective. Be ruthless about scope creep.

### Complexity smell check

If the plan would touch more than 8 files or introduce more than 2 new modules/classes, treat that as a smell. Challenge whether the same goal can be achieved with fewer moving parts. Present the concern to the engineer before proceeding.

### Built-in check

For each pattern or infrastructure the plan introduces, check: does the framework or runtime already provide this? Does the codebase already have a convention for this? If the plan rolls a custom solution where a built-in or existing pattern exists, flag it as a scope reduction opportunity.

---

## Guiding Principles

These are not checklist items. They are the instincts the agent should apply when drafting the plan:

- **Boring by default.** Prefer proven patterns over clever new approaches. Only introduce new technology or patterns when the existing options are clearly inadequate.
- **Incremental over revolutionary.** Strangler fig, not big bang. Refactor, not rewrite. Canary, not global rollout.
- **Reversibility preference.** Prefer changes that are easy to undo — feature flags, backward-compatible migrations, incremental rollouts. Make the cost of being wrong low.
- **Essential vs accidental complexity.** Before adding anything, ask: "Is this solving a real problem or one we created?" If the plan feels complex, the approach may be wrong.
- **Make the change easy, then make the easy change.** If the codebase is not ready for the change, refactor first in a separate step. Never mix structural and behavioral changes.
- **Minimal diff.** Achieve the goal with the fewest new abstractions and files touched. DRY matters, but premature abstraction is worse than repetition.
- **Systems over heroes.** Design for a tired engineer at 3am, not your best engineer on their best day. Explicit is better than clever.

---

## Plan Template

```markdown
# Plan: [Title]

## Problem Brief
[Copy from Stage 1]

## What Already Exists
List existing code, flows, or patterns that already partially solve the problem.
For each: are we reusing it, extending it, or replacing it? If replacing, why?

## Approach
[High-level description of the solution. Why this approach over alternatives.]

## NOT in Scope
Work that was considered and explicitly deferred, with a one-line rationale for each.

## Alternatives Considered
[What else was evaluated and why it was rejected.]

## Detailed Changes

### [Change Group 1: e.g., "Database schema changes"]
- File: `path/to/file.ts`
  - What: [specific change]
  - Why: [reason this change is needed]
  - Edge cases: [what could go wrong]

### [Change Group 2: e.g., "API endpoint changes"]
...

## Data Flow
[ASCII diagram of how data moves through the changed code]

## Failure Modes
For each new codepath or integration point:
- What could realistically go wrong in production (timeout, race condition, stale data, null reference, etc.)
- What the user sees when it fails
- Whether error handling exists for it
- Whether a test covers it

If a failure mode has no test AND no error handling AND would be silent to the user, flag it as a **critical gap**.

## Test Plan
- [ ] Unit test: [specific scenario]
- [ ] Unit test: [edge case]
- [ ] Integration test: [end-to-end flow]
- [ ] Manual verification: [what to check]

## Migration / Rollback
- Is this change backward compatible?
- If not: what is the migration plan?
- How to roll back if something goes wrong?

## PR Breakdown
- PR 1: [scope] (can be reviewed independently)
- PR 2: [scope] (depends on PR 1)
...

## Checklist Before Execution
- [ ] Step 0 scope challenge completed
- [ ] All edge cases documented
- [ ] Failure modes analyzed
- [ ] Error paths specified
- [ ] Test scenarios listed
- [ ] No open questions remaining
```

---

## Plan Quality Checklist

Before moving to Plan Review, verify:

- [ ] **Scope:** Step 0 was done — existing code checked, minimum change identified, complexity challenged
- [ ] **Specificity:** Every change references a specific file and function, not "update the auth module"
- [ ] **Completeness:** Error paths, edge cases, and empty/null states are addressed
- [ ] **Failure modes:** Each new codepath has a realistic failure scenario documented
- [ ] **Testability:** Every behavioral change has a corresponding test scenario
- [ ] **Consistency:** New patterns match existing codebase conventions
- [ ] **Reversibility:** Rollback path is clear for anything hard to undo
- [ ] **Scope discipline:** Nothing in the plan goes beyond the Problem Brief; deferred work is in "NOT in Scope"
- [ ] **Dependencies:** Order of changes is correct; no circular dependencies
- [ ] **Experience:** Known pitfalls from past work are accounted for (see [Experience Library](experience-library.md))

---

## Exit criteria

The plan is detailed enough that a different engineer (or agent) could execute it without asking clarifying questions.

**Next:** Proceed to [Stage 3: Plan Review](stage-3-plan-review.md)
