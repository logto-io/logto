# Stage 6: Ship

**Goal:** Get the code to production safely.

**Who:** Author ships, team monitors

**Previous:** [Stage 5: Code Review](stage-5-code-review.md)

---

## Ship checklist

- [ ] **Feature flag removal:** Remove `isDevFeaturesEnabled` guards from the new feature code
- [ ] **Changeset:** Write changeset entry via `/logto-changeset` describing the change
- [ ] **OpenAPI docs:** Ensure all new/modified API endpoints have complete OpenAPI documentation
- [ ] **User-facing docs:** Add new feature description to [logto-io/docs](https://github.com/logto-io/docs)
---

## Exit criteria

Code is in production and behaving as expected.
