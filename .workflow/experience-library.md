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

_To be added by the team. Examples of good entries:_

- Database migration ordering when multiple PRs are in flight
- i18n string formatting pitfalls (apostrophes in French/Italian breaking quoted strings)
- Monorepo dependency resolution edge cases
- API backward compatibility rules for public endpoints
- Test isolation requirements for database-dependent tests
