---
"@logto/cli": major
"@logto/cloud": patch
"@logto/console": patch
"@logto/core": patch
"@logto/schemas": patch
"@logto/shared": patch
---

**Seed data for cloud**

- cli!: remove `oidc` option for `database seed` command as it's unused
- cli: add hidden `--cloud` option for `database seed` command to init cloud data
- cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
- move `UrlSet` and `GlobalValues` to `@logto/shared`
