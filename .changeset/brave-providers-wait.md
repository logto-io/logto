---
"@logto/core": patch
"@logto/phrases": patch
---

respond 502 `connector.social_provider_unreachable` when the social provider cannot be reached

A social sign-in whose token exchange or user-info request failed at the network level (timeout, connection reset, DNS failure) ended with a 500 "Internal server error.", indistinguishable from a bug in Logto. The social library now relays such a failure as a 502 that carries the network code and the request's method and URL (origin and pathname only), so a caller can tell a provider outage from a Logto error and the end user gets a translated message instead of a generic one.
