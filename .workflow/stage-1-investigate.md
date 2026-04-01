# Stage 1: Investigate & Define

**Goal:** Understand the problem completely before proposing solutions.

**Who:** Engineer in conversation with agent

**Next stage:** [Stage 2: Detailed Plan](stage-2-plan.md)

---

## How the conversation works

This stage is a structured dialogue. The agent drives the conversation by asking questions one at a time, researching the codebase between questions, and challenging vague answers. The engineer provides domain knowledge, user context, and judgment.

**Step 1: Engineer states the task.** Can be one sentence or a full issue description.

**Step 2: Agent does initial research.** Before asking anything, the agent:
- Reads related code, traces call paths, finds usage patterns
- Checks git history for prior changes in the affected area
- Searches the [Experience Library](experience-library.md) for relevant entries
- Forms an initial understanding of the problem space

**Step 3: Agent asks diagnostic questions, one at a time.** The agent picks questions based on task type and asks them sequentially, waiting for each answer before asking the next. The agent should push for specificity — vague answers get follow-up questions.

---

## Diagnostic questions by task type

### Bug fix

| # | Question | Push until you hear |
|---|----------|-------------------|
| 1 | What is the exact symptom? (error message, wrong behavior, data corruption) | A specific, reproducible description. Not "it's broken" but "clicking X returns a 500 with error Y" |
| 2 | When did this start? What changed? | A commit, a deploy, a config change, or "it was always like this" |
| 3 | Who is affected and how severely? | Specific user segment + impact. "All free-tier users get a blank page on login" not "some users have issues" |
| 4 | What is the current workaround? | What users or support are doing right now. If no workaround exists, that tells you severity |

### New feature

| # | Question | Push until you hear |
|---|----------|-------------------|
| 1 | What problem does this solve for the user? | A specific user action or pain point. Not "improve the experience" but "users cannot do X without doing Y first" |
| 2 | What is the user currently doing instead? | The status quo workflow, even if it is ugly. This reveals whether the need is real |
| 3 | What is the smallest version of this that delivers value? | One specific behavior change. The wedge, not the platform |
| 4 | What must NOT change? (backward compat, API contracts, existing behavior) | Specific constraints with reasons |
| 5 | How will we know this is working? | A measurable outcome or a specific test scenario |

### Refactor / tech debt

| # | Question | Push until you hear |
|---|----------|-------------------|
| 1 | What is the concrete pain this causes today? | Specific symptoms: "deploy takes 40 minutes", "every new endpoint requires changes in 5 files", "tests are flaky because of X" |
| 2 | What triggered this now? Why not 3 months ago or 3 months from now? | The forcing function. If there is none, question the priority |
| 3 | What does "done" look like? | A specific measurable state, not "cleaner code" |

---

## Agent proactive concerns

After each answer, the agent should raise concerns based on:

1. **Experience Library matches.** If a past pitfall is relevant, the agent says: _"Experience Library note: [title]. [one-sentence summary]. Should we account for this?"_

2. **Codebase patterns.** If the agent finds something during research that contradicts or complicates the engineer's answer, it says so directly: _"I found that `path/to/file.ts` already does something similar. Should we reuse or replace it?"_

3. **Hidden assumptions.** If the engineer's answer contains an unstated assumption, the agent calls it out: _"This assumes X. Is that verified, or should we check?"_

---

## Smart routing

Not every task needs all questions:

- **If the engineer provides a detailed issue with reproduction steps:** Skip symptom questions, start at root cause / constraints
- **If the engineer says "just fix this typo":** Skip the conversation, go directly to Problem Brief (Light depth)
- **If the agent's initial research already answers a question:** State the finding and ask "Does this match your understanding?" instead of asking the question cold

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
