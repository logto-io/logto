---
"@logto/core": patch
---

fix accepting and revoking an organization invitation at the same time

When an organization invitation was accepted and revoked at the same time, both requests could succeed: the invitee joined the organization while the invitation was reported as revoked. The status of an invitation now changes only once, and the second change fails.
