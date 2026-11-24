---
"@logto/core": patch
"@logto/schemas": patch
---

make token revocation, session and grant listing, and the sign-in interaction and device code lookups use indexes so they stay fast for tenants with many tokens

Core queries each tenant's data as that tenant's database role under row-level security, where expressions such as `payload->>'accountId'` can never be index conditions. These `oidc_model_instances` lookups now compare the trigger-kept `payload_grant_id`, `payload_account_id`, `payload_uid` and `payload_user_code` columns instead.

Upgrade note: the database alteration counts unexpired `oidc_model_instances` rows whose lookup columns are still empty, fills them in batches of 1,000, and fails if any remain, so the new lookups never run against unfilled rows. It reads every unexpired row once, so on large tables it can take a while and generates write-ahead log when rows need filling. It is safe to rerun if interrupted. Rows with a key longer than 128 characters are skipped and listed in the output.
