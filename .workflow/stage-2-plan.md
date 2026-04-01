# Stage 2: Detailed Plan

**Goal:** Produce a plan so detailed that execution is mechanical.

**Who:** Engineer (agent drafts, human refines)

**Previous:** [Stage 1: Investigate & Define](stage-1-investigate.md) | **Next:** [Stage 3: Plan Review](stage-3-plan-review.md)

---

This is the most important stage. Invest time here. A 30-minute plan saves hours of rework.

**Agent's role:**
- Draft the full plan based on the Problem Brief
- Read all affected code to understand current state
- Propose specific changes at the file and function level
- Identify edge cases, error paths, and test scenarios
- Search for prior patterns in codebase to maintain consistency

**Human's role:**
- Challenge every assumption in the plan
- Add domain knowledge the agent cannot infer
- Ensure the plan handles known pitfalls from past experience (see [Experience Library](experience-library.md))
- Decide between alternative approaches
- Verify the plan is complete enough for mechanical execution

---

## Plan Template

```markdown
# Plan: [Title]

## Problem Brief
[Copy from Stage 1]

## Approach
[High-level description of the solution. Why this approach over alternatives.]

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

## Error Handling
For each new error path:
- What triggers it
- What the user sees
- What gets logged
- How to recover

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
- [ ] All edge cases documented
- [ ] Error paths specified
- [ ] Test scenarios listed
- [ ] No open questions remaining
```

---

## Plan Quality Checklist

Before moving to Plan Review, verify:

- [ ] **Specificity:** Every change references a specific file and function, not "update the auth module"
- [ ] **Completeness:** Error paths, edge cases, and empty/null states are addressed
- [ ] **Testability:** Every behavioral change has a corresponding test scenario
- [ ] **Consistency:** New patterns match existing codebase conventions
- [ ] **Reversibility:** Rollback path is clear for anything hard to undo
- [ ] **Scope:** Nothing in the plan goes beyond the Problem Brief
- [ ] **Dependencies:** Order of changes is correct; no circular dependencies
- [ ] **Experience:** Known pitfalls from past work are accounted for (see [Experience Library](experience-library.md))

---

## Exit criteria

The plan is detailed enough that a different engineer (or agent) could execute it without asking clarifying questions.

**Next:** Proceed to [Stage 3: Plan Review](stage-3-plan-review.md)
