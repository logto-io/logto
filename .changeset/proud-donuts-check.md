---
"@logto/shared": major
"@logto/console": patch
"@logto/schemas": patch
"@logto/core": patch
"@logto/cli": patch
---

standardize id and secret generators

- Remove `buildIdGenerator` export from `@logto/shared`
- Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
- Align comment and implementation of `buildIdGenerator` in `@logto/shared`
  - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
- Use `generateStandardSecret` for all secret generation
