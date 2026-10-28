---
'@logto/core': minor
'@logto/phrases': patch
---

use dedicated i18n error codes for organization invitation validation errors

Organization invitation creation and status update errors now return specific, localized codes under the `organization` namespace instead of the generic `request.invalid_input`, so clients can reliably distinguish each failure case and messages render in the user's language. HTTP status codes are unchanged.

If your integration matches `request.invalid_input` for these responses, update it to match the new codes:

- `POST /api/organization-invitations`
  - `organization.expires_at_in_future` (400): the value of `expiresAt` is not in the future.
  - `organization.invitee_already_member` (422): the invitee is already a member of the organization.
- `PUT /api/organization-invitations/{id}/status`
  - `organization.invitation_status_not_changeable` (422): the invitation is no longer pending.
  - `organization.accepted_user_id_required` (422): `acceptedUserId` is missing when accepting.
  - `organization.accepted_user_email_mismatch` (422): the accepted user's primary email does not match the invitee.
