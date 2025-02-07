---
"@logto/core": patch
---

bug fix. Trigger the `Organization.Membership.Updated` webhook when a user accepts an invitation and join an organization.

Added a new `Organization.Membership.Accepted` webhook event in the `PUT /api/organization-invitations/{id}/status` endpoint. This event will be triggered when the organization-invitation status is updated to `accepted`, and user is added to the organization.
