# Stage 5: Code Review

**Goal:** Verify that the code matches the plan, and the code quality is production-ready.

**Who:** Another engineer reviews. Agent assists with automated checks.

**Previous:** [Stage 4: Execute](stage-4-execute.md) | **Next:** [Stage 6: Ship](stage-6-ship.md)

---

## What code review checks

Since we have a detailed plan, code review focuses on:

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

## Agent-assisted code review

- Agent reads the plan and the diff, produces a plan compliance report
- Agent checks for common issues (N+1 queries, missing error handling, etc.)
- Human reviews the agent's findings and adds judgment

---

## Review format

```
## Plan Compliance
- [DONE] Item 1: implemented in file.ts:42
- [DONE] Item 2: implemented in handler.ts:15
- [CHANGED] Item 3: plan said X, code does Y instead (reason: ...)
- [MISSING] Item 4: not found in diff

## Code Issues
- [file:line] Description of issue
  Suggestion: ...

## Verdict: APPROVED / CHANGES REQUESTED
```

---

## Exit criteria

All PRs approved by at least one other engineer.

**Next:** Proceed to [Stage 6: Ship](stage-6-ship.md)
