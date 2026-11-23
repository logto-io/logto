---
"@logto/core": patch
"@logto/schemas": patch
---

make audit log filtering by user or application, and webhook recent logs and execution stats, use indexes so they stay fast for tenants with many logs

Core queries each tenant's data as that tenant's database role under row-level security, where expressions such as `payload->>'userId'` can never be index conditions. These `logs` lookups now compare the trigger-kept `payload_user_id`, `payload_application_id` and `payload_hook_id` columns instead.

Upgrade note: the database alteration counts `logs` rows whose lookup columns are still empty, fills them in batches of 1,000, and fails if any fillable rows remain. It reads the whole `logs` table, so on large tables it can take a while and generates write-ahead log when rows need filling. It is safe to rerun if interrupted. Rows with a `userId` over 128 characters, a `hookId` over 21 characters or an `applicationId` over 2,600 bytes are skipped and counted in the output, and none of these lookups match them.
