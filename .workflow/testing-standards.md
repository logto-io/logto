# Testing Standards

> Test requirements for the Engineering Delivery Workflow. These complement the [Coding Standards](coding-standards.md) and apply during planning (Stage 2), execution (Stage 4), and review (Stage 5).

---

## What Coverage is Required

Every behavioral change needs test coverage. The type of test depends on the **blast radius** of the change:

| Blast radius | Required coverage |
|---|---|
| Within a single module (pure logic, transformations, validation) | Unit test |
| Across module boundaries (API endpoint, service interaction, data persistence) | Unit test + Integration test |
| User-facing flow (UI, auth flow, onboarding) | Unit test + Integration test + Manual verification |
| Infrastructure only (config, env, migration) | Integration test or manual verification |
| Bug fix | Regression test at the level where the bug was observed |

**Rule of thumb:** If it touches business logic, unit test it. If it crosses a boundary (network, database, service), also integration test it.

---

## Test Plan in Plans

When writing a plan (Stage 2), the Test Plan section must be specific. Do not write generic placeholders.

### Bad

```markdown
## Test Plan
- [ ] Unit test: test the new function
- [ ] Integration test: test the API
```

This tells the executor nothing. It will be interpreted as "write whatever tests seem reasonable," which defeats the purpose of planning.

### Good

```markdown
## Test Plan

### Unit tests
- [ ] `buildQuery` returns correct filter for single field match
- [ ] `buildQuery` returns correct filter for multi-field AND
- [ ] `buildQuery` throws on empty filter object
- [ ] `buildQuery` escapes special characters in search term

### Integration tests
- [ ] `GET /api/resources?search=foo` returns matching resources
- [ ] `GET /api/resources?search=foo` with no matches returns empty array
- [ ] `GET /api/resources?search=` returns 400
- [ ] `GET /api/resources?search=foo` respects pagination params

### Manual verification
- [ ] Search UI handles CJK character input correctly
```

Each test item should describe the **scenario** and the **expected outcome**. The executor should be able to write the test from the description alone without re-reading the plan's implementation section.

### Regression tests for bug fixes

When the plan is a bug fix, the test plan must include a regression test that:

1. Reproduces the original bug (fails without the fix)
2. Passes with the fix applied

This is the strongest proof that the fix works and the bug won't recur.

---

## Coverage

Coverage thresholds are project-specific. However, these principles are universal:

- **New code should have meaningful coverage** — not 100% line coverage for its own sake, but coverage of the important behaviors and edge cases
- **Do not game coverage** by testing trivial getters or no-op functions. Test the logic that matters
- **Coverage is a trailing indicator, not a goal.** A well-tested module with 70% coverage is better than a trivially-tested module with 100%

---

## Tests During Execution (Stage 4)

- Write tests alongside or before the implementation (same commit or test-first)
- Run affected tests after each significant change — do not batch all testing to the end
- All existing tests must pass before creating a PR
- If a change is expected to break existing tests, update those tests as part of the same change — never leave a PR with known test failures

---

## Tests During Review (Stage 5)

Reviewers should verify:

- [ ] Every behavioral change in the diff has a corresponding test
- [ ] Tests cover failure cases, not just the happy path
- [ ] Test descriptions match what the test actually verifies
- [ ] No tests are commented out or skipped without a tracked issue
- [ ] Test plan items from Stage 2 are all accounted for — DONE, CHANGED (with reason), or MISSING (with reason)
