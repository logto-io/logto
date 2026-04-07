# Stage 3: Plan Review

**Goal:** Catch problems before any code is written.

**Who:** Another engineer reviews. This is a human review.

**Previous:** [Stage 2: Detailed Plan](stage-2-plan.md) | **Next:** [Stage 4: Execute](stage-4-execute.md)

---

Plan review is cheaper than code review. A design problem caught here saves a full implementation cycle.

## What to review

- **Scope:** Does this solve the stated problem, nothing more? Can existing abstractions be reused?
- **Correctness:** Is the data flow diagram accurate? Does the migration plan work?
- **Completeness:** Are all test scenarios listed? Is the rollback plan realistic?
- **Consistency:** Do new patterns match existing codebase conventions?

---

## Optional: agent pre-review

Before sending the plan to a human reviewer, you can ask the agent to do a first pass. This is optional but can save the reviewer's time by catching mechanical issues early.

What the agent can check:
- Referenced files and functions actually exist in the codebase
- The plan is consistent with current code state (no stale references)
- Similar patterns already exist in the codebase (reuse opportunities)
- Recent changes on `master` that might conflict

The agent pre-review does NOT replace human review. It catches "you referenced a function that was renamed last week" type issues, not "this approach will cause a race condition under load."

---

## Review outcomes

- **Approved:** Plan is ready for execution
- **Approved with comments:** Minor items to address during execution
- **Revise:** Significant issues found, plan needs rework before execution
- **Rethink:** Approach is wrong, go back to [Stage 2](stage-2-plan.md)

---

## Exit criteria

At least one other engineer has approved the plan.

**Next:** Proceed to [Stage 4: Execute](stage-4-execute.md)
