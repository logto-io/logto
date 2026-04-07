# Engineering Delivery Workflow

## Core Insight

```
Plan quality × Agent compliance = Delivery quality
```

Front-load all judgment into the plan. Make the plan so detailed that execution becomes mechanical.

---

## Principles

1. **Every task follows the same flow.** Small bug or big feature, same stages. Only the depth changes.
2. **The plan is the central artifact.** Everything flows from it. Execution follows it. Review checks against it.
3. **Plans must cover all details.** If it is not in the plan, the agent will not think of it.
4. **Agent assists, human decides.** The agent drafts the plan. You review it. The agent executes. You verify the output.
5. **Deviations from plan must be explicit.** If execution reveals the plan was wrong, update the plan first. Then continue. Never silently drift.

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

Each stage has its own detailed guide in [`.workflow/`](.workflow/):

| Stage | Guide | When to read |
|-------|-------|-------------|
| 1. Investigate & Define | [`.workflow/stage-1-investigate.md`](.workflow/stage-1-investigate.md) | Starting a new task |
| 2. Detailed Plan | [`.workflow/stage-2-plan.md`](.workflow/stage-2-plan.md) | Problem Brief is ready |
| 3. Plan Review | [`.workflow/stage-3-plan-review.md`](.workflow/stage-3-plan-review.md) | Plan is drafted |
| 4. Execute | [`.workflow/stage-4-execute.md`](.workflow/stage-4-execute.md) | Plan is approved |
| 5. Code Review | [`.workflow/stage-5-code-review.md`](.workflow/stage-5-code-review.md) | PRs are ready |
| 6. Ship | [`.workflow/stage-6-ship.md`](.workflow/stage-6-ship.md) | Code is approved |

Shared references:

| Reference | File |
|-----------|------|
| Depth Levels | [`.workflow/depth-levels.md`](.workflow/depth-levels.md) |
| PR Description Template | [`.workflow/pr-template.md`](.workflow/pr-template.md) |
| Experience Library | [`.workflow/experience-library.md`](.workflow/experience-library.md) |
| Coding Standards | [`.workflow/coding-standards.md`](.workflow/coding-standards.md) |
| Testing Standards | [`.workflow/testing-standards.md`](.workflow/testing-standards.md) |

---

## Depth Levels

Not every task needs the same rigor. The engineer decides the depth level in Stage 1.

| | Light | Standard | Full |
|---|---|---|---|
| **When** | Bug fix, typo, config change, < 50 LOC | Feature, refactor, 50-500 LOC | Large feature, breaking change, > 500 LOC, multi-PR |
| **Plan** | Inline in PR description | Full plan template | Full plan + diagrams + alternatives |
| **Plan Review** | Self-review | 1 engineer | 2 engineers |
| **Code Review** | 1 reviewer | 1 reviewer, plan compliance | 2 reviewers, full audit |

If uncertain, go one level up. Over-planning costs 10 minutes. Under-planning costs days.

---

## Roles & Ownership

6 engineers, no dedicated PM/designer. Everyone wears multiple hats.

| Responsibility | Who |
|---|---|
| Problem Brief author | The engineer who picks up the task |
| Plan author | Same engineer (agent drafts, engineer refines) |
| Plan reviewer | Another engineer (rotate) |
| Code reviewer | Another engineer (rotate, can be same as plan reviewer) |
| Ship decision | Plan author |
| Experience Library maintenance | Everyone (add entries as you go) |

No one reviews their own plan or code. At least 2 people are involved in every Standard or Full task.

---

## Maintenance

- This document and `.workflow/` live in the repo. Changes go through normal PR review.
- When an incident happens, ask: "Would a better plan have prevented this?" If yes, update the Experience Library.
