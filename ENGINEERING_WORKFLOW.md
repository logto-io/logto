# Engineering Delivery Workflow

## Why This Exists

AI coding agents are fast. That speed is a trap if you skip the thinking.

The biggest risk in AI-assisted development is not writing bad code. It is writing the wrong code, fast, with confidence. An agent can produce 500 lines in minutes. If those 500 lines solve the wrong problem, or miss an edge case that corrupts data, the speed works against you.

**Slow is smooth, smooth is fast.** This workflow forces the thinking to happen before the typing. The return on a good plan is 10x higher than it used to be, because agents follow plans far better than they make autonomous decisions.

### The core insight

```
Plan quality × Agent compliance = Delivery quality
```

- Agents are excellent at generating detailed plans (low cost, high thoroughness)
- Agents are excellent at following plans (high compliance, low drift)
- Agents are poor at making judgment calls mid-execution (context loss, hallucination)

Therefore: **front-load all judgment into the plan.** Make the plan so detailed that execution becomes mechanical. Then review becomes simple: did the code match the plan?

---

## Principles

1. **Every task follows the same flow.** Small bug or big feature, same stages. Only the depth changes.
2. **The plan is the central artifact.** Everything flows from it. Execution follows it. Review checks against it.
3. **Plans must cover all details.** Edge cases, error handling, test scenarios, migration steps, rollback strategy. If it is not in the plan, the agent will not think of it.
4. **Agent assists, human decides.** The agent drafts the plan. You review it, challenge it, refine it. The agent executes the plan. You verify the output. Responsibility is always on the human.
5. **Deviations from plan must be explicit.** If execution reveals the plan was wrong, update the plan first. Then continue. Never silently drift.
6. **Completeness is cheap now.** AI makes the marginal cost of handling edge cases near-zero. Do the complete thing. Don't skip the last 10%.

---

## Workflow Overview

```
┌─────────────┐    ┌──────────────┐    ┌────────────┐    ┌───────────┐    ┌──────────┐    ┌──────┐
│  Investigate │───▶│  Plan        │───▶│ Plan Review│───▶│  Execute  │───▶│  Review  │───▶│ Ship │
│  & Define   │    │  (Detailed)  │    │            │    │           │    │  (Code)  │    │      │
└─────────────┘    └──────────────┘    └────────────┘    └───────────┘    └──────────┘    └──────┘
       │                  │                   │                │                │              │
   Agent: research    Agent: draft       Human: approve    Agent: code     Human+Agent:   Human: go/no-go
   Human: define      Human: refine      Human: decide     Human: monitor  check vs plan  Agent: PR + changelog
```

---

## Stage 1: Investigate & Define

**Goal:** Understand the problem completely before proposing solutions.

**Who:** Engineer (with agent assistance for research)

**Agent's role:**
- Read related code, trace call paths, find usage patterns
- Search for prior art (existing solutions, library support, known pitfalls)
- Summarize findings in structured format

**Human's role:**
- Define what problem we are actually solving (not what the reporter thinks they want)
- Identify constraints, affected systems, and stakeholders
- Decide scope: is this a quick fix or does it need a full plan?

**Output: Problem Brief**

A Problem Brief must contain:

| Field | Description |
|-------|-------------|
| Problem | What is actually broken or missing? One sentence. |
| Impact | Who is affected and how? Include severity. |
| Root cause / Gap | Why does this problem exist? (for bugs: root cause; for features: what is the gap) |
| Constraints | What cannot change? (backward compat, performance budget, API contracts) |
| Affected systems | Which packages, services, or modules are involved? |
| Scope decision | Light / Standard / Full (see Depth Levels below) |

**Exit criteria:** The problem is understood well enough that two engineers would agree on what needs to be solved.

---

## Stage 2: Detailed Plan

**Goal:** Produce a plan so detailed that execution is mechanical.

**Who:** Engineer (agent drafts, human refines)

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
- Ensure the plan handles known pitfalls from past experience (see Experience Library)
- Decide between alternative approaches
- Verify the plan is complete enough for mechanical execution

### Plan Template

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

### Plan Quality Checklist

Before moving to Plan Review, verify:

- [ ] **Specificity:** Every change references a specific file and function, not "update the auth module"
- [ ] **Completeness:** Error paths, edge cases, and empty/null states are addressed
- [ ] **Testability:** Every behavioral change has a corresponding test scenario
- [ ] **Consistency:** New patterns match existing codebase conventions
- [ ] **Reversibility:** Rollback path is clear for anything hard to undo
- [ ] **Scope:** Nothing in the plan goes beyond the Problem Brief
- [ ] **Dependencies:** Order of changes is correct; no circular dependencies
- [ ] **Experience:** Known pitfalls from past work are accounted for (see Experience Library)

**Exit criteria:** The plan is detailed enough that a different engineer (or agent) could execute it without asking clarifying questions.

---

## Stage 3: Plan Review

**Goal:** Catch problems before any code is written.

**Who:** Another engineer reviews. Agent can assist with automated checks.

Plan review is cheaper than code review. A design problem caught here saves a full implementation cycle.

### What to review

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

### Agent-assisted review

The agent can help by:
- Verifying that referenced files and functions actually exist
- Checking that the plan is consistent with current code state
- Finding similar patterns in the codebase for comparison
- Identifying potential conflicts with recent changes

### Review outcomes

- **Approved:** Plan is ready for execution
- **Approved with comments:** Minor items to address during execution
- **Revise:** Significant issues found, plan needs rework before execution
- **Rethink:** Approach is wrong, go back to Stage 2

**Exit criteria:** At least one other engineer has approved the plan.

---

## Stage 4: Execution

**Goal:** Implement exactly what the plan says.

**Who:** Engineer directing agent

**Agent's role:**
- Follow the plan step by step
- Write code, tests, and migrations as specified
- Flag any discrepancy between plan and reality

**Human's role:**
- Monitor agent output for quality
- Make judgment calls when the plan does not cover a situation
- Update the plan if deviations are needed (before continuing execution)

### Execution rules

1. **One PR per logical unit.** Follow the PR breakdown from the plan. Each PR should be independently reviewable.

2. **Plan divergence protocol.** If the agent encounters something the plan did not anticipate:
   - STOP execution
   - Document the discovery
   - Update the plan
   - Get approval if the change is significant
   - Then continue

3. **Commit discipline:**
   - Each commit does one thing
   - Commit message explains why, not what
   - Tests and implementation in the same commit (or test-first if TDD)

4. **Quality gates during execution:**
   - Run tests after each significant change
   - Lint passes continuously
   - Type checks pass continuously

**Exit criteria:** All plan items are marked DONE. All tests pass. All PRs are created.

---

## Stage 5: Code Review

**Goal:** Verify that the code matches the plan, and the code quality is production-ready.

**Who:** Another engineer reviews. Agent assists with automated checks.

### What code review checks

Since we have a detailed plan, code review focuses on:

**Plan compliance** (primary):
- [ ] Does the code implement what the plan says?
- [ ] Are there changes not in the plan? (scope creep)
- [ ] Are there plan items not implemented? (gaps)

**Code quality** (secondary):
- [ ] No obvious bugs or logic errors
- [ ] Error handling is correct
- [ ] Tests actually test the right things
- [ ] No security issues (injection, auth bypass, data leaks)
- [ ] Performance is acceptable

**Agent-assisted code review:**
- Agent reads the plan and the diff, produces a plan compliance report
- Agent checks for common issues (N+1 queries, missing error handling, etc.)
- Human reviews the agent's findings and adds judgment

### Review format

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

**Exit criteria:** All PRs approved by at least one other engineer.

---

## Stage 6: Ship

**Goal:** Get the code to production safely.

**Who:** Author ships, team monitors

### Ship checklist

- [ ] All PRs merged
- [ ] CI passes on main branch
- [ ] Changeset / changelog updated
- [ ] Database migrations applied (if any)
- [ ] Feature flags configured (if any)
- [ ] Monitoring / alerts in place for new code paths
- [ ] Rollback plan tested or documented
- [ ] Stakeholders notified (if user-facing change)

**Exit criteria:** Code is in production and behaving as expected.

---

## Depth Levels

Not every task needs the same rigor. Use depth levels to right-size the process.

| | Light | Standard | Full |
|---|---|---|---|
| **When** | Bug fix, typo, config change, < 50 LOC | Feature, refactor, 50-500 LOC | Large feature, breaking change, > 500 LOC, multi-PR |
| **Problem Brief** | 2-3 sentences in the PR description | Full template | Full template + architecture context |
| **Plan** | Inline in PR description or commit message | Full plan template | Full plan template + diagrams + alternatives |
| **Plan Review** | Self-review or async comment | Synchronous review by 1 engineer | Synchronous review by 2 engineers |
| **Code Review** | 1 reviewer, focus on correctness | 1 reviewer, plan compliance check | 2 reviewers, full compliance audit |
| **Ship Checklist** | "Tests pass, merging" | Standard checklist | Full checklist + monitoring verification |

**The engineer decides the depth level in Stage 1.** If uncertain, go one level up. It is better to over-plan a simple task (cost: 10 minutes) than under-plan a complex one (cost: days of rework).

---

## Experience Library

> This section is a living document. Add entries when you encounter non-obvious pitfalls, and reference them in future plans.

The Experience Library captures hard-won knowledge that should be considered during the Plan stage. Each entry describes a pitfall or best practice that is not obvious from the code alone.

### Format

```markdown
### [Short title]
- **Context:** When does this apply?
- **Pitfall:** What goes wrong if you don't know this?
- **Rule:** What should you do instead?
- **Example:** A concrete case where this mattered.
```

### Entries

_To be added by the team. Examples of good entries:_

- Database migration ordering when multiple PRs are in flight
- i18n string formatting pitfalls (apostrophes in French/Italian breaking quoted strings)
- Monorepo dependency resolution edge cases
- API backward compatibility rules for public endpoints
- Test isolation requirements for database-dependent tests

When writing a plan, the agent (or engineer) should scan the Experience Library for relevant entries and explicitly call them out in the plan.

---

## Roles & Ownership

With 6 engineers and no dedicated PM/designer, everyone wears multiple hats.

| Responsibility | Who |
|---|---|
| Problem Brief author | The engineer who picks up the task |
| Plan author | Same engineer (agent drafts, engineer refines) |
| Plan reviewer | Another engineer (rotate) |
| Code reviewer | Another engineer (rotate, can be same as plan reviewer) |
| Ship decision | Plan author |
| Experience Library maintenance | Everyone (add entries as you go) |

### Rotation principle

No one reviews their own plan or code. For a team of 6, this means at least 2 people are involved in every Standard or Full task.

---

## How This Becomes Agent-Native

This SOP is written for humans first. The next step is to encode it into agent-consumable artifacts:

1. **Plan template → Agent prompt.** The plan template becomes the system prompt for the planning agent. The Plan Quality Checklist becomes validation constraints.

2. **Experience Library → Agent context.** Each entry becomes a constraint injected into the planning prompt. "When you see X, always consider Y."

3. **Review checklists → Agent review skill.** The plan compliance check and code quality checks become a structured review skill that agents run automatically.

4. **Depth levels → Agent routing.** The agent reads the scope decision from the Problem Brief and adjusts its thoroughness accordingly.

The goal: an engineer describes a problem, the agent produces a high-quality plan, the engineer reviews and approves, the agent executes, the agent runs its own review, the engineer does a final check and ships.

The human stays in the loop at every decision point. The agent handles the volume.

---

## Maintenance

- This document lives in the repo. Changes go through normal PR review.
- Review quarterly: is the process working? What stages are being skipped? Why?
- The Experience Library should grow steadily. If it is not growing, people are not capturing learnings.
- When an incident happens, always ask: "Would a better plan have prevented this?" If yes, update the Experience Library.
