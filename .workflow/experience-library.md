# Experience Library

> This is a living document. Add entries when you encounter non-obvious pitfalls, and reference them in future plans.

The Experience Library captures hard-won knowledge that should be considered during the Plan stage. Each entry describes a pitfall or best practice that is not obvious from the code alone.

When writing a plan, the agent (or engineer) should scan this file for relevant entries and explicitly call them out in the plan.

---

## Entry format

```markdown
### [Short title]
- **Context:** When does this apply?
- **Pitfall:** What goes wrong if you don't know this?
- **Rule:** What should you do instead?
- **Example:** A concrete case where this mattered.
```

---

## Entries

### OIDC implementation details: trust the code, not the spec alone
- **Context:** Any work touching OIDC flows (authorization, token exchange, claims, scopes, etc.)
- **Pitfall:** The OIDC spec is intentionally broad and leaves many implementation details unspecified. LLMs tend to hallucinate plausible-sounding but incorrect behavior based on spec generalities.
- **Rule:** Always read the actual implementation before making changes. The OIDC provider is a Logto fork at `logto-io/node-oidc-provider` (installed locally as `oidc-provider` in node_modules). Treat the code as the source of truth, not the spec text.
- **Example:** Token introspection response fields, claim filtering logic, and interaction policies all have Logto-specific behavior that diverges from spec defaults.

### Cloud repo: multi-tenancy and billing live elsewhere
- **Context:** Any work involving tenant management, subscription, billing, quota enforcement, or cloud-only features.
- **Pitfall:** Searching only this OSS repo and missing that the relevant logic lives in the cloud repo, or duplicating logic that already exists there.
- **Rule:** The cloud repo is at `logto-io/cloud` (locally cloned at `/Users/sijie/Development/svhd/cloud`). When a feature touches tenant lifecycle or billing, check the cloud repo first. This OSS repo should not contain cloud-specific business logic.
- **Example:** Subscription tier checks, seat limits, and tenant provisioning are all in the cloud repo.

### Dev feature flag: gate new features behind `isDevFeaturesEnabled`
- **Context:** Adding any new user-facing feature (API endpoint, UI page, sign-in method, etc.)
- **Pitfall:** Shipping a half-finished or untested feature directly to production without a gate.
- **Rule:** Wrap new features with the `isDevFeaturesEnabled` flag. In production and staging this flag is `false`; only in dev (sandbox) environments it is `true`. The flag is removed only after manual QA in dev confirms the feature is ready. Small, low-risk bug fixes may skip this.
- **Example:** A new MFA method should be gated so it is testable in dev (sandbox) but invisible in production and staging until explicitly released.

### Changeset strategy for multi-PR features
- **Context:** Developing a feature that spans multiple PRs before it is released.
- **Pitfall:** Adding a changeset in every intermediate PR creates noise and premature version bumps for unreleased work.
- **Rule:** For multi-PR features gated behind `isDevFeaturesEnabled`, defer the changeset to the final PR that removes the dev flag. This keeps the changelog clean and ties the version bump to the actual release.
- **Example:** PRs 1-3 add a new connector type behind the dev flag with no changeset; PR 4 removes the flag and includes the changeset.

### API backward compatibility: no breaking changes
- **Context:** Any modification to existing API endpoints (request/response schema, behavior, error codes).
- **Pitfall:** Introducing a breaking change that disrupts existing integrations, especially for self-hosted users who cannot coordinate upgrades.
- **Rule:** All API changes must be backward compatible. If a change cannot be made without breaking the existing contract, stop and discuss with the team before proceeding. Additive changes (new optional fields, new endpoints) are fine.
- **Example:** Renaming a response field or changing an error code from 400 to 422 is a breaking change, even if it seems "more correct."

### API changes require OpenAPI doc updates
- **Context:** Any PR that adds, modifies, or removes API endpoints or their schemas.
- **Pitfall:** API behavior drifts from documentation, causing confusion for integrators and breaking SDK generation.
- **Rule:** Every API change must include corresponding updates to the OpenAPI documentation. This is not optional — treat it as part of the definition of done.
- **Example:** Adding an optional query parameter to a list endpoint requires updating the OpenAPI spec for that route.
