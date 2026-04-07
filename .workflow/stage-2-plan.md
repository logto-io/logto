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

Search the codebase for code that already partially or fully solves the problem. List findings explicitly — this becomes the "What already exists" section of the plan.

### Complexity smell check

If the plan would touch more than 8 files or introduce more than 2 new modules/classes, treat that as a smell. Challenge whether the same goal can be achieved with fewer moving parts. Present the concern to the engineer before proceeding.

---

## What Does NOT Belong in the Plan

Engineering practices (coding standards, lint rules, comment conventions) are applied during [execution](stage-4-execute.md). Don't repeat them in the plan.

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

- [ ] **Scope:** Step 0 was done — existing code checked, complexity challenged
- [ ] **Specificity:** Every change references a specific file and function, not "update the auth module"
- [ ] **Scope discipline:** Nothing in the plan goes beyond the Problem Brief; deferred work is in "NOT in Scope"
- [ ] **Experience:** Known pitfalls from past work are accounted for (see [Experience Library](experience-library.md))

---

## Exit criteria

The plan is detailed enough that a different engineer (or agent) could execute it without asking clarifying questions.

**Next:** Proceed to [Stage 3: Plan Review](stage-3-plan-review.md)
