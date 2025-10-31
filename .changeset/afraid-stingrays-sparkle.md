---
'@logto/schemas': patch
'@logto/core': patch
---

align refresh token grant lifetime with 180-day TTL

Refresh tokens were expiring after 14 days because the provider grant TTL was still capped at the default two weeks, regardless of the configured refresh token TTL.

Now set the OIDC grant TTL to 180 days so refresh tokens can live for their configured duration, also expand the refresh token TTL up to 180 days.
