---
"@logto/core": patch
"@logto/console": patch
"@logto/phrases": patch
---

fix manual unlock not clearing active security verification lockouts

Sentinel activity deletion now also removes active blocked decisions older than one hour, so manually unlocking a user works when the lockout duration exceeds 60 minutes. The manual unlock dialog and API documentation now mention user IDs and security verification lockouts.
