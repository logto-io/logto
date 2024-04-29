---
"@logto/phrases": patch
"@logto/core": patch
---

Fix file upload API.

The `koa-body` has been upgraded to the latest version, which caused the file upload API to break. This change fixes the issue.

The `ctx.request.files.file` in the new version is an array, so the code has been updated to pick the first one.
