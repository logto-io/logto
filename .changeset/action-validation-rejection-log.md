---
"@logto/core": patch
"@logto/schemas": patch
---

record why Logto rejected an action result in the action audit log

When a post first-factor verification or post sign-in action returns a result that Logto does not accept, such as an invalid user patch, a malformed migrated MFA factor, a changed sign-in identifier, or an identity conflict, the action audit log entry is now marked as an error and carries a `validation` field with the rejection reason. It names the failing field paths, or the index, type, and reason of the rejected MFA factor, and never includes values from the result such as secrets or backup codes. Accepted results are recorded with `validation: { outcome: 'accepted' }`.
