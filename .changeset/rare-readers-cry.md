---
"@logto/core": patch
---

prevent i18n context contamination by using request-scoped instances

This bug fix resolves a concurrency issue in i18n handling by moving from a global i18next instance to request-scoped instances.

Problem:
When handling concurrent requests:

- The shared global `i18next` instance's language was being modified via `changeLanguage()` calls.
- This could lead to race conditions where requests might receive translations in unexpected languages.
- Particularly problematic in multi-tenant environments with different language requirements.

Solution:

- Updated `koaI18next` middleware to create a cloned i18next instance for each request.

- Attach the request-scoped instance to Koa context (`ctx.i18n`) All subsequent middleware and handlers should now use `ctx.i18n` instead of the global `i18next` instance.

- Maintains the global instance for initialization while preventing cross-request contamination
