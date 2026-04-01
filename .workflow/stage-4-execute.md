# Stage 4: Execute

**Goal:** Implement exactly what the plan says.

**Who:** Engineer directing agent

**Previous:** [Stage 3: Plan Review](stage-3-plan-review.md) | **Next:** [Stage 5: Code Review](stage-5-code-review.md)

---

**Agent's role:**
- Follow the plan step by step
- Write code, tests, and migrations as specified
- Flag any discrepancy between plan and reality

**Human's role:**
- Monitor agent output for quality
- Make judgment calls when the plan does not cover a situation
- Update the plan if deviations are needed (before continuing execution)

---

## Execution rules

### 1. One PR per logical unit

Follow the PR breakdown from the plan. Each PR should be independently reviewable.

### 2. Plan divergence protocol

If the agent encounters something the plan did not anticipate:
- STOP execution
- Document the discovery
- Update the plan
- Get approval if the change is significant
- Then continue

### 3. Commit discipline

- Each commit does one thing
- Commit message explains why, not what
- Tests and implementation in the same commit (or test-first if TDD)

### 4. Quality gates during execution

- Run tests after each significant change
- Lint passes continuously
- Type checks pass continuously

---

## Exit criteria

All plan items are marked DONE. All tests pass. All PRs are created.

**Next:** Proceed to [Stage 5: Code Review](stage-5-code-review.md)
