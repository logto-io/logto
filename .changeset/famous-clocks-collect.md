---
"@logto/cli": patch
---

keep original untranslated mark when syncing keys

When executing `pnpm cli translate sk --target all`:

- use JSDoc comment to stick with the standard approach
- if the value was originally untranslated, keep the mark

For example:

**Original**

```ts
{
  "hello": "Hello", // UNTRANSLATED
  "world": "世界",
}
```

**Now**

```ts
{
  /** UNTRANSLATED */
  "hello": "Hello",
  "world": "世界",
}
```
