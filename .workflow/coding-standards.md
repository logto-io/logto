# Coding Standards

> Conventions that apply during execution (Stage 4) and review (Stage 5). These are not suggestions — they are the baseline for all code in this repo.

---

## ESLint bypass rules

ESLint rules exist for a reason. Bypassing them is sometimes necessary, but every bypass is a small debt. Treat it like a code smell: acceptable when justified, unacceptable when lazy.

### When bypass is allowed

| Category | Typical rules | When it's OK |
|----------|---------------|-------------|
| FP mutation rules | `@silverhand/fp/no-mutation`, `no-let`, `no-mutating-methods` | Imperative code that cannot be expressed functionally: React refs, DOM manipulation, accumulators in complex algorithms, test setup/teardown |
| Type assertion | `no-restricted-syntax`, `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-explicit-any` | TypeScript's type system cannot express the actual type, and the assertion is provably safe from context (e.g., `Object.entries` losing key type, response from `json()`) |
| Complexity / max-lines | `complexity`, `max-lines` | The function or file is genuinely complex and splitting would hurt readability more than help. This is a judgment call — if in doubt, refactor |
| React patterns | `react/no-array-index-key`, `jsx-a11y/no-autofocus`, `react/boolean-prop-naming` | The lint rule's assumption doesn't match the use case (e.g., index-as-key for static lists, autofocus on modal inputs) |
| Import side effects | `import/no-unassigned-import` | Side-effect imports (CSS, polyfills) that are intentional |
| Await in loop | `no-await-in-loop` | Sequential execution is required by the underlying API or ordering matters |

### When bypass is NOT allowed

- **Blanket file-level disables.** `/* eslint-disable */` (all rules) is almost never acceptable. Disable only the specific rule(s) needed.

### Bypass format: always include a reason

Every `eslint-disable` must include an inline reason using the `--` separator:

```typescript
// Good — reason explains why the rule doesn't apply here
// eslint-disable-next-line @silverhand/fp/no-mutation -- React ref assignment
ref.current = element;

// Good — for block disables, the comment goes on the same line
/* eslint-disable @silverhand/fp/no-mutation -- building response object imperatively for readability */

// Bad — no reason, reviewer has to guess why
// eslint-disable-next-line @silverhand/fp/no-mutation
ref.current = element;
```

The reason should be **short and specific** — not "needed here" or "doesn't apply", but *why* it doesn't apply. Examples of good reasons:

- `-- React ref assignment`
- `-- Object.entries loses key type`
- `-- response.json() returns any`
- `-- sequential API calls required by provider`
- `-- polyfill by design`
- `-- static list, keys never change`

### Scope: prefer narrow over broad

- Prefer `eslint-disable-next-line` over block `eslint-disable` / `eslint-enable`.
- Prefer block disable over file-level disable.
- Always disable the **specific rule**, never `/* eslint-disable */` without a rule name.

### @ts-expect-error

Same principle applies to `@ts-expect-error` — always include a reason:

```typescript
// @ts-expect-error -- mock object intentionally missing optional fields
const mockContext = { ... };
```

---

## Comment conventions

- **No agent reasoning in comments.** Comments like "After discussing with the agent, we decided to..." or "The agent suggested..." do not belong in code. The *why* matters, not *who* or *how* it was discussed.
- Use JSDoc (`/** ... */`) for exported functions, classes, and types that form a public API boundary (SDK, shared libraries, connector kit), and for non-obvious parameters or return values.
