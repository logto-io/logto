---
"@logto/core": patch
---

Retry Postgres pool initialization during core startup so transient connection timeouts do not crash fresh deployments immediately.
