---
"@logto/core": patch
---

update the `getI18nEmailTemplate` fallback logic to also attempt to retrieve the `generic` template with default locale, if both the locale-specific and fallback templates are unavailable
