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

### 1. One PR = one agent session

Each PR from the plan should be executed in its own agent session. This keeps sessions focused and avoids context window exhaustion on large tasks.

**If the plan has multiple PRs**, the agent must NOT start coding immediately. Instead, it should:

1. **Output a task handoff list** — one entry per PR, in execution order. Each entry contains:
   - PR number and scope (from the plan)
   - Dependencies (which PRs must be merged first)
   - A ready-to-use prompt the human can paste into a new agent session

2. **The prompt must be self-contained.** Each prompt should include:
   - A reference to the plan file (e.g., "Read `.workflow/plans/xxx.md`")
   - Which PR / change group to execute (e.g., "Execute PR 2: API endpoint changes")
   - What has already been completed (e.g., "PR 1 has been merged, database schema is in place")
   - Any decisions or deviations from prior PRs that affect this one

3. **The human decides when to start each session.** The agent does not assume all PRs will be done back-to-back. There may be reviews, merges, or other work in between.

Example handoff:

```
## Task Handoff

### PR 1: Database schema changes (start here)
Dependencies: none

Prompt:
> Read the plan at `.workflow/plans/xxx.md`. Execute PR 1 (Database schema changes).
> This is the first PR — no prior work to account for.

### PR 2: API endpoint changes
Dependencies: PR 1 merged

Prompt:
> Read the plan at `.workflow/plans/xxx.md`. Execute PR 2 (API endpoint changes).
> PR 1 (database schema) has been merged. The new `user_preferences` table is available.

### PR 3: Frontend integration
Dependencies: PR 2 merged

Prompt:
> Read the plan at `.workflow/plans/xxx.md`. Execute PR 3 (Frontend integration).
> PR 1 and PR 2 are merged. The API endpoint `GET /api/preferences` is available.
```

**If the plan has only one PR**, proceed to execute directly in the current session.

### 2. Plan file persistence

The plan must be saved to a file (e.g., `.workflow/plans/[task-name].md`) so that future agent sessions can read it. Do not rely on conversation context to carry the plan across sessions.

### 3. Plan divergence protocol

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

### 5. PR description

When creating the PR, use the [PR Description Template](pr-template.md). The agent must fill in every applicable section — including the plan compliance table (scoped to this PR's items only) and self-check — before requesting review. This is the agent's self-review gate: if it cannot check a box, it should fix the issue first, not leave it for the reviewer.

For multi-PR plans, the PR description must clearly state which part of the plan this PR covers (e.g. "PR 2/4 — API endpoint changes") and what context the reviewer needs (what was already merged, what comes next).

---

## Exit criteria

All plan items are marked DONE. All tests pass. All PRs are created with filled-in PR descriptions.

**Next:** Proceed to [Stage 5: Code Review](stage-5-code-review.md)
