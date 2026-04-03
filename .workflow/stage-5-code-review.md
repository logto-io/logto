# Stage 5: Code Review

**Goal:** Verify that the code matches the plan, and the code quality is production-ready.

**Who:** Another engineer reviews. This is a human review.

**Previous:** [Stage 4: Execute](stage-4-execute.md) | **Next:** [Stage 6: Ship](stage-6-ship.md)

---

Since we have a detailed plan, code review is simpler than usual: the primary job is checking whether the code matches the plan.

## What to review

### Plan compliance (primary)

- [ ] Does the code implement what the plan says?
- [ ] Are there changes not in the plan? (scope creep)
- [ ] Are there plan items not implemented? (gaps)

### Code quality (secondary)

- [ ] No obvious bugs or logic errors
- [ ] Error handling is correct
- [ ] Tests actually test the right things
- [ ] No security issues (injection, auth bypass, data leaks)
- [ ] Performance is acceptable

---

## Optional: agent pre-review

Before sending the PR to a human reviewer, you can ask the agent to do a first pass. This is optional but can reduce back-and-forth on mechanical issues.

What the agent can check:
- Plan compliance: extract plan items, cross-reference against the diff, report DONE / CHANGED / MISSING for each
- Common code issues: N+1 queries, missing error handling, unused imports, inconsistent naming
- Test coverage: are the test scenarios from the plan actually covered?

The agent pre-review does NOT replace human review. It catches "you forgot to implement plan item #7" type issues, not "this abstraction will be painful to maintain."

### Agent pre-review format

```
## Plan Compliance
- [DONE] Item 1: implemented in file.ts:42
- [DONE] Item 2: implemented in handler.ts:15
- [CHANGED] Item 3: plan said X, code does Y instead (reason: ...)
- [MISSING] Item 4: not found in diff

## Code Issues
- [file:line] Description of issue
  Suggestion: ...
```

---

## Exit criteria

All PRs approved by at least one other engineer.

**Next:** Proceed to [Stage 6: Ship](stage-6-ship.md)
