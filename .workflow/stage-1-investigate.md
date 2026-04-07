# Stage 1: Investigate & Define

**Goal:** Understand the problem completely before proposing solutions.

**Who:** Engineer in conversation with agent

**Next stage:** [Stage 2: Detailed Plan](stage-2-plan.md)

---

## How the conversation works

This stage is a **guided conversation** — through questions, not code research. The agent does NOT need to read code at this stage — understanding the problem comes from the conversation, not the codebase.

### Conversation flow

1. **Engineer states the task.**
2. **Agent restates and identifies gaps.** Ask 1-2 most important clarifying questions — not all at once.
3. **Guided back-and-forth.** The agent fills in the full picture, one question at a time.
4. **Convergence.** The agent writes a [Premise challenge](#premise-challenge), then produces the [Problem Brief](#output-problem-brief).

---

## What the agent should cover (by task type)

These are not checklists to walk through sequentially. They are the key things the agent should understand by the end of the conversation. Cover them naturally as the discussion evolves.

### Bug fix

- **Exact symptom**, **timeline**, **blast radius**
- **Workaround:** No workaround = high severity signal

### New feature

- **User problem** and **status quo** (reveals whether the need is real)
- **Minimum viable scope:** The smallest version that delivers value — the wedge, not the platform
- **Constraints:** What must NOT change (backward compat, API contracts, existing behavior)
- **Success signal**

### Refactor / tech debt

- **Concrete pain** and **forcing function** (why now?)
- **Definition of done:** A specific measurable state, not "cleaner code"

---

## How the agent should guide the conversation

**Dig for the "why" behind a solution.** Engineers often come with a solution, not a problem. Understand the underlying need before accepting the proposed approach.

**Question whether it is worth doing.** If the scenario sounds like a rare edge case, probe the actual frequency and impact. Make sure ROI is consciously evaluated before committing engineering time.

**Propose depth level when you have enough context.** _"Based on what you've described, this sounds like a [Light/Standard] scope because [reason]. Does that feel right?"_

---

## Smart routing

Not every task needs a deep conversation:

- **Detailed issue with reproduction steps:** Skip the basics, jump into root cause and constraints discussion
- **Trivial task ("fix this typo"):** Skip the conversation entirely, go straight to Problem Brief (Light depth)
- **Agent's research already answers something:** State the finding and ask "Does this match your understanding?" instead of asking the question from scratch

---

## Escape hatch

If the engineer wants to skip ahead: the agent asks the 1-2 most critical remaining questions, then proceeds. If the engineer pushes back a second time, respect it and move on. Don't block the flow.

---

## Premise challenge

Before writing the Problem Brief, the agent states its understanding as testable premises:

```
Based on our conversation, here is my understanding:
1. The problem is: [specific statement]
2. The root cause / gap is: [specific statement]
3. The scope should be: [Light / Standard / Full] because [reason]
4. Key constraint: [statement]

Do you agree? Anything to correct?
```

If the engineer disagrees with a premise, loop back and clarify. Do not proceed to planning on a misunderstanding.

---

## Output: Problem Brief

A Problem Brief must contain:

| Field | Description |
|-------|-------------|
| Problem | What is actually broken or missing? One sentence. |
| Impact | Who is affected and how? Include severity. |
| Root cause / Gap | Why does this problem exist? (for bugs: root cause; for features: what is the gap) |
| Constraints | What cannot change? (backward compat, performance budget, API contracts) |
| Affected systems | Which packages, services, or modules are involved? |
| Scope decision | Light / Standard / Full (see [Depth Levels](depth-levels.md)) |
| Experience Library flags | Any relevant entries surfaced during the conversation |
| Open questions | Anything unresolved that the plan must address |

---

## Exit criteria

The engineer and agent agree on the premises. The problem is understood well enough that two engineers would agree on what needs to be solved.

**Next:** Proceed to [Stage 2: Detailed Plan](stage-2-plan.md)
