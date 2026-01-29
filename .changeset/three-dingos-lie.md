---
"@logto/shared": patch
"@logto/core": patch
"@logto/cli": patch
---

allow disabling Postgres `statement_timeout` for PgBouncer/RDS Proxy

- add `DATABASE_STATEMENT_TIMEOUT` parsing in shared, core, and CLI
- set `DATABASE_STATEMENT_TIMEOUT=DISABLE_TIMEOUT` to omit the startup parameter
