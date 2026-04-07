# PR Description Template

A standardized PR description format for the Engineering Delivery Workflow. This template serves two roles:

1. **Agent self-check.** When an agent creates a PR, it fills in this template. The structured format forces the agent to verify plan compliance and quality before requesting review.
2. **Reviewer guide.** When a human reviews the PR, the filled-in template provides the context needed to review efficiently — what changed, why, whether the plan was followed, and where to focus attention.

**Who fills this in:** The PR author (agent or human). Do it when the PR is ready for review, not before.

**How to use:** Copy the template below into the PR description. Delete sections marked as optional if they don't apply. For Light-depth tasks, the template is minimal. For Standard/Full, fill in every section.

---

## Template

````markdown
### Depth

<!-- Select one. See .workflow/depth-levels.md. If uncertain, go one level up. -->

- [ ] 🟢 Light — bug fix, typo, config, < 50 LOC
- [ ] 🟡 Standard — feature, refactor, 50–500 LOC
- [ ] 🔴 Full — large feature, breaking change, > 500 LOC, multi-PR

---

### Summary

<!-- What changed, and why. 2-5 sentences. For Light tasks, this IS your problem brief. -->



---

### Plan

<!-- Standard/Full: link to the plan file and specify which part of the plan this PR covers. -->
<!-- Light: write "N/A" -->

Plan: <!-- e.g. `.workflow/plans/xxx.md` -->
Scope: <!-- e.g. "PR 2/4 — API endpoint changes" or "Only PR" -->

<!-- For multi-PR plans: briefly note what has already been merged and what comes after this PR. -->
<!-- This helps the reviewer understand the PR in context without reading the full plan. -->

---

### Plan compliance

<!-- Standard/Full only. Delete this section for Light tasks. -->
<!-- Only list plan items scoped to THIS PR — not the entire plan. -->
<!-- Agent: fill this by cross-referencing each plan item against the diff. -->
<!-- Reviewer: this is your primary review artifact — check these claims against the code. -->

| Status | Plan item | Location | Notes |
|--------|-----------|----------|-------|
| ✅ DONE | | | |
| ⚠️ CHANGED | | | Why it diverged from the plan |
| ❌ MISSING | | | Why it's deferred or dropped |

---

### Changes

<!-- List the key changes, grouped by area. Help the reviewer navigate the diff. -->
<!-- For multi-package changes, group by package. -->

-

---

### Self-check

<!-- Author: check every box before requesting review. If a box doesn't apply, check it and write "N/A". -->
<!-- Reviewer: a checked box means the author claims this is done. Verify the non-obvious ones. -->

**Review readiness**

- [ ] I have reviewed the full diff and verified every change works as intended

**Correctness**

- [ ] Code does what the plan/summary says — no more, no less
- [ ] Edge cases and error paths are handled
- [ ] No unintended side effects on existing behavior

**Tests**

- [ ] New/changed behavior has test coverage
- [ ] Tests cover failure cases, not just the happy path
- [ ] All existing tests still pass

**Security**

- [ ] No secrets, tokens, or credentials in the diff
- [ ] User input is validated/sanitized where applicable
- [ ] Auth/permission checks are in place for new endpoints

**Consistency**

- [ ] Follows existing codebase patterns and naming conventions
- [ ] No debug artifacts (`console.log`, `TODO: remove`, commented-out code)

---

### Reviewer focus

<!-- Optional but encouraged. Tell the reviewer where to spend their time. -->
<!-- Good examples: "The migration in alter.ts is the riskiest part", "Please verify the token refresh edge case in session.ts" -->
<!-- Bad examples: "Please review everything", "LGTM" -->


````

---

## How each depth level uses this template

| Section | Light | Standard | Full |
|---------|-------|----------|------|
| Depth | Required | Required | Required |
| Summary | Required (serves as problem brief) | Required | Required |
| Plan + Scope | N/A | Required | Required |
| Plan compliance | Delete | Required (this PR's items only) | Required (this PR's items only) |
| Changes | Required | Required | Required |
| Self-check | Required | Required | Required |
| Reviewer focus | Optional | Encouraged | Required |

## Note on ship readiness

Ship readiness (feature flags, changeset, docs) is handled in [Stage 6: Ship](stage-6-ship.md), not in individual PRs. A plan that spans multiple PRs will typically have a dedicated ship PR or handle ship items after all implementation PRs are merged. See Stage 6 for details.
