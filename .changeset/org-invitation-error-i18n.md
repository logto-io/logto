---
'@logto/core': minor
---

use dedicated i18n error codes for organization invitation validation errors

Organization invitation creation and status update errors previously returned the generic `request.invalid_input` code with English-only `details`. They now return specific, localized codes under the `organization` namespace: `invitee_already_member`, `expires_at_in_future`, `invitation_status_not_changeable`, `accepted_user_id_required`, and `accepted_user_email_mismatch`, so clients can reliably distinguish each failure case and messages render in the user's language.
