---
"@logto/console": patch
"@logto/phrases": patch
---

api resource indicator must be a valid absolute uri

An invalid indicator will make Console crash without this check.

Note: We don't mark it as a breaking change as the api behavior has not changed, only adding the check on Console.
