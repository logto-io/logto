# Stage 6: Ship

**Goal:** Get the code to production safely.

**Who:** Author ships, team monitors

**Previous:** [Stage 5: Code Review](stage-5-code-review.md)

---

## When to do this

Ship readiness is handled **after all implementation PRs for a task are merged** — not on each individual PR. For multi-PR plans, this typically means a dedicated ship PR or a final pass on the last implementation PR.

## Ship checklist

- [ ] **Feature flag removal:** Remove `isDevFeaturesEnabled` guards from the new feature code
- [ ] **Changeset:** Write changeset entry via `/logto-changeset` describing the change
- [ ] **OpenAPI docs:** Ensure all new/modified API endpoints have complete OpenAPI documentation
- [ ] **User-facing docs:** Add new feature description to [logto-io/docs](https://github.com/logto-io/docs)

For single-PR tasks (Light depth), these items can be handled in the same PR. For multi-PR tasks, create a separate ship PR or fold them into the final implementation PR.

---

## Exit criteria

Code is in production and behaving as expected.
