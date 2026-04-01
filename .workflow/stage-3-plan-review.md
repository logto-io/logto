# Stage 3: Plan Review

**Goal:** Catch problems before any code is written.

**Who:** Another engineer reviews. Agent can assist with automated checks.

**Previous:** [Stage 2: Detailed Plan](stage-2-plan.md) | **Next:** [Stage 4: Execute](stage-4-execute.md)

---

Plan review is cheaper than code review. A design problem caught here saves a full implementation cycle.

## What to review

**Scope check:**
- Does this solve the stated problem, nothing more?
- Can the same goal be achieved with fewer changes?
- Are there existing abstractions or utilities we should reuse instead of building new ones?

**Correctness check:**
- Is the data flow diagram accurate?
- Are all error paths handled?
- Are concurrent access / race condition risks addressed?
- Does the migration plan actually work?

**Completeness check:**
- Is any edge case missing?
- Are all test scenarios listed?
- Is the rollback plan realistic?

**Consistency check:**
- Do new patterns match existing codebase conventions?
- Will this create tech debt or divergence?

---

## Agent-assisted review

The agent can help by:
- Verifying that referenced files and functions actually exist
- Checking that the plan is consistent with current code state
- Finding similar patterns in the codebase for comparison
- Identifying potential conflicts with recent changes

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
