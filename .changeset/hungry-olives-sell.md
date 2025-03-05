---
"@logto/core": minor
---

refactor: switch to `@logto/experience` package with latest [Experience API](https://openapi.logto.io/group/endpoint-experience)

In this release, we have transitioned the user sign-in experience from the legacy `@logto/experience-legacy` package to the latest `@logto/experience` package. This change fully adopts our new [Experience API](https://openapi.logto.io/group/endpoint-experience), enhancing the underlying architecture while maintaining the same user experience.

- Package update: The user sign-in experience now utilizes the `@logto/experience` package by default.
  API Transition: The new package leverages our latest [Experience API](https://openapi.logto.io/group/endpoint-experience).
- No feature changes: Users will notice no changes in functionality or experience compared to the previous implementation.
