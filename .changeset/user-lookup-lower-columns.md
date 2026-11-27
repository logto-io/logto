---
"@logto/core": patch
"@logto/schemas": patch
---

make email and username sign-in lookups, uniqueness checks and the username case-conflict report use indexes so they stay fast for tenants with many users

Core queries each tenant's data as that tenant's database role under row-level security, where expressions such as `lower(primary_email)` can never be index conditions. These `users` lookups now compare the trigger-kept `primary_email_lower` and `username_lower` columns instead.

Upgrade note: the database alteration counts users whose lower-cased email or username column is missing or out of date, fills them in batches of 1,000, and fails if any remain, so no user is left unable to sign in by email or username. Filling a user also updates its `updated_at`. It reads the whole `users` table, so on large tables it can take a while. It is safe to rerun if interrupted. Users whose lower-cased email or username is longer than 384 characters are skipped and counted in the output.
