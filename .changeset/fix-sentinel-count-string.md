---
"@logto/core": patch
---

fix identifier-lockout sentinel misfiring because `count(*)` was treated as a string

Postgres returns `count(*)` as a bigint that Slonik surfaces as a string. The sentinel added `1` to this value to decide whether to lock an identifier, so `'10' + 1` evaluated to `'101'` and the failed-attempt threshold (default 100) tripped far too early — roughly at 10 failed attempts. The count is now coerced to a number so the threshold is compared numerically.
