---
"@logto/core": patch
"@logto/core-kit": patch
"@logto/console": patch
"@logto/phrases": patch
---

treat Gmail address aliases as the same address in custom email allowlist and blocklist rules

The matcher treats gmail.com and googlemail.com as equivalent and ignores local-part dots. The Console now shows custom email rule examples and Gmail matching behavior in the field descriptions, with shorter input placeholders.
