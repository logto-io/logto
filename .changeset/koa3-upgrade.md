---
"@logto/core": patch
---

upgrade the HTTP framework from Koa 2 to Koa 3

Bump `koa` to `^3.2.1` together with the middleware upgrades the compatibility audit proved necessary: `koa-body@8`, `koa-compress@^5.2.2`, `koa-logger@4`, `koa-mount@^4.2.0`, and `@types/koa@3`. No behavior change is intended: the two Koa 3 semantic changes that affected our code (`ctx.request.origin` now returning the `Origin` header, and `HttpError` identity across multiple `http-errors` copies) are patched with equivalents that behave identically on both majors, and `koa-body@8`'s new single-file unwrapping is normalized back inside `koaGuard` so multipart uploads keep their previous shape.
