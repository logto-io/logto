---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
---

rate-limit outbound verification-code and message sends per recipient and suppress delivery to unknown recipients

Adds a mandatory, system-level per-recipient send rate limit across all email/SMS send paths (experience verification codes including MFA, the account and management verification-code APIs, `/me`, organization invitations, and the legacy interaction API), emits a `Message.RateLimited` webhook when a send is throttled, and suppresses verification-code delivery to unregistered recipients when registration is disabled to prevent account enumeration. The `Message.RateLimited` event is now selectable in the Console webhook settings.
