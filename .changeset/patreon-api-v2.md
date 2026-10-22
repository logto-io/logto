---
"@logto/connector-patreon": patch
---

restore Patreon social sign-in by using Patreon API v2

Patreon removed the v1 public API, which made the connector fail with `410 Gone`. The connector now requests user profile fields from the v2 identity endpoint, so Patreon sign-in works again.
