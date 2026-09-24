---
"@logto/core": patch
---

fix dynamic app clients not receiving refresh tokens when they request `offline_access` without `prompt=consent`

Logto now adds the consent prompt to these requests. Users already see the consent screen on every dynamic app authorization, so the sign-in experience is unchanged.
