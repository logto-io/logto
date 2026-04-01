# Depth Levels

Not every task needs the same rigor. The engineer decides the depth level in Stage 1.

| | Light | Standard | Full |
|---|---|---|---|
| **When** | Bug fix, typo, config change, < 50 LOC | Feature, refactor, 50-500 LOC | Large feature, breaking change, > 500 LOC, multi-PR |
| **Problem Brief** | 2-3 sentences in the PR description | Full template | Full template + architecture context |
| **Plan** | Inline in PR description or commit message | Full plan template | Full plan template + diagrams + alternatives |
| **Plan Review** | Self-review or async comment | Synchronous review by 1 engineer | Synchronous review by 2 engineers |
| **Code Review** | 1 reviewer, focus on correctness | 1 reviewer, plan compliance check | 2 reviewers, full compliance audit |
| **Ship Checklist** | "Tests pass, merging" | Standard checklist | Full checklist + monitoring verification |

If uncertain, go one level up. It is better to over-plan a simple task (cost: 10 minutes) than under-plan a complex one (cost: days of rework).
