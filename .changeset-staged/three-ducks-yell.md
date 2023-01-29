---
"@logto/cli": major
"@logto/console": major
"@logto/core": major
"@logto/schemas": major
---

drop settings table and add systems table

**BREAKING CHANGES**

- core: removed `GET /settings` and `PATCH /settings` API
- core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
  - `/configs/*` APIs are config/key-specific now. they may have different logic per key
- cli: removed `alterationState` and added `adminConsole` in valid `logto db config` keys, since:
  - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
  - alteration state is still a system-wide config
