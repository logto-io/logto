# Stage 1: Investigate & Define

**Goal:** Understand the problem completely before proposing solutions.

**Who:** Engineer in conversation with agent

**Next stage:** [Stage 2: Detailed Plan](stage-2-plan.md)

---

## How the conversation works

This stage is a **guided conversation**. The agent's job is to draw out the full picture of what the engineer needs — through questions, not code research. It should feel like brainstorming with a sharp colleague who asks the right questions and pushes for clarity.

**The agent's role:** Listen, ask clarifying questions, challenge vague answers, summarize understanding, and guide the engineer toward a complete problem definition. The agent does NOT need to read code at this stage — understanding the problem comes from the conversation, not the codebase.

**The engineer's role:** Describe the problem, provide context, answer questions, and confirm or correct the agent's understanding.

### Conversation flow

1. **Engineer states the task.** Can be one sentence, an issue link, or a full description.

2. **Agent restates and identifies gaps.** The agent's first response should:
   - Restate its understanding of what the engineer said (so the engineer can correct misunderstandings immediately)
   - Identify what information is missing or unclear
   - Ask the first 1-2 most important clarifying questions — not all questions at once

3. **Guided back-and-forth.** The agent leads the conversation to fill in the full picture. Each turn, the agent should:
   - Acknowledge what the engineer just clarified
   - Connect it to the bigger picture ("OK, so this means the scope is...")
   - Ask the next most important question based on what is still unclear
   - When the engineer gives a vague answer, push for specifics — don't accept "it should be better" or "some users have issues"

4. **Convergence.** When the agent believes it has a complete understanding, it writes a [Premise challenge](#premise-challenge) for the engineer to confirm. Then produces the [Problem Brief](#output-problem-brief).

---

## What the agent should cover (by task type)

These are not checklists to walk through sequentially. They are the key things the agent should understand by the end of the conversation. Cover them naturally as the discussion evolves.

### Bug fix

- **Exact symptom:** A specific, reproducible description — not "it's broken" but "clicking X returns a 500 with error Y"
- **Timeline:** When it started, what changed (a commit, a deploy, a config change, or "it was always like this")
- **Blast radius:** Who is affected and how severely
- **Workaround:** What users or support are doing right now. No workaround = high severity signal

### New feature

- **User problem:** A specific user action or pain point — not "improve the experience" but "users cannot do X without doing Y first"
- **Status quo:** What users are doing instead today. This reveals whether the need is real
- **Minimum viable scope:** The smallest version that delivers value. One specific behavior change — the wedge, not the platform
- **Constraints:** What must NOT change (backward compat, API contracts, existing behavior)
- **Success signal:** How we know this is working — a measurable outcome or a specific test scenario

### Refactor / tech debt

- **Concrete pain:** Specific symptoms — "deploy takes 40 minutes", "every new endpoint requires changes in 5 files"
- **Forcing function:** Why now? If there is none, question the priority
- **Definition of done:** A specific measurable state, not "cleaner code"

---

## How the agent should guide the conversation

**One or two questions at a time.** Don't dump a list of 5 questions. Ask the most important one, wait for the answer, then ask the next based on what you learned.

**Challenge vague answers.** If the engineer says "some users have issues", push: "Can you narrow it down? Is this all users, free-tier only, specific browser, specific API call?"

**Summarize as you go.** After a few exchanges, briefly restate the current understanding so the engineer can course-correct early: _"So far I understand: [X]. Is that right?"_

**Dig for the "why" behind a solution.** Engineers often come with a solution, not a problem — "we need to add a config option for X." The agent should ask: _"What is the user trying to do that they can't today? What happens if we don't do this?"_ Understand the underlying need before accepting the proposed approach. The real problem may have a simpler solution, or the proposed solution may not actually address it.

**Question whether it is worth doing.** Not every request deserves implementation. If the described scenario sounds like a rare edge case, the agent should probe: _"How often does this actually happen? How many users are affected? What is the cost of not doing this?"_ The goal is not to block work, but to make sure the engineer has consciously evaluated ROI before committing engineering time.

**Call out hidden assumptions.** If the engineer's answer contains an unstated assumption: _"This assumes X. Is that correct?"_

**Propose when you have enough context.** When the agent can form an opinion on scope or priority, propose it: _"Based on what you've described, this sounds like a [Light/Standard] scope because [reason]. Does that feel right?"_

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
