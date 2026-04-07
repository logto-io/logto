# Stage 5: Code Review

**Goal:** Verify that the code matches the plan, and the code quality is production-ready.

**Who:** Another engineer reviews. This is a human review.

**Previous:** [Stage 4: Execute](stage-4-execute.md) | **Next:** [Stage 6: Ship](stage-6-ship.md)

---

Since we have a detailed plan, code review is simpler than usual: the primary job is checking whether the code matches the plan.

## Starting point: the PR description

Every PR should arrive with a filled-in [PR Description Template](pr-template.md). This is your review starting point:

1. **Plan compliance table** — the author (agent or human) has already cross-referenced every plan item against the diff. Your job: verify these claims. Check DONE items actually exist. Check CHANGED items have valid reasons. Ask about MISSING items.
2. **Self-check boxes** — the author claims these are all handled. Spot-check the non-obvious ones (security, edge cases).
3. **Reviewer focus** — the author tells you where the risk is. Start there.

If the PR description is incomplete or missing, send it back. A well-filled template is a prerequisite for review, not optional.

## What to review

### Plan compliance (primary)

- [ ] Does the code implement what the plan says?
- [ ] Are there changes not in the plan? (scope creep)
- [ ] Are there plan items not implemented? (gaps)
- [ ] Do the CHANGED items in the plan compliance table have valid justifications?

### Code quality (secondary)

- [ ] No obvious bugs or logic errors
- [ ] Error handling is correct
- [ ] Tests actually test the right things
- [ ] No security issues (injection, auth bypass, data leaks)
- [ ] Performance is acceptable

### Ship readiness (tertiary)

Ship readiness (feature flags, changeset, docs) is handled in [Stage 6: Ship](stage-6-ship.md), not during code review of individual PRs. Do not block a PR for missing changeset or docs if the plan has a dedicated ship step.

However, if this is the **final or only PR** for a task, check:

- [ ] No feature flags left that should have been removed
- [ ] Changeset is present and describes the change accurately

---

## Optional: agent pre-review

Before sending the PR to a human reviewer, you can ask the agent to do a first pass. This is optional but can reduce back-and-forth on mechanical issues.

What the agent can check:
- Plan compliance: extract plan items, cross-reference against the diff, report DONE / CHANGED / MISSING for each
- Common code issues: N+1 queries, missing error handling, unused imports, inconsistent naming
- Test coverage: are the test scenarios from the plan actually covered?

The agent pre-review does NOT replace human review. It catches "you forgot to implement plan item #7" type issues, not "this abstraction will be painful to maintain."

Note: if the agent already filled in the [PR Description Template](pr-template.md) during Stage 4, the plan compliance table there serves the same purpose as a separate pre-review. No need to do both.

---

## Exit criteria

All PRs approved by at least one other engineer.

**Next:** Proceed to [Stage 6: Ship](stage-6-ship.md)
