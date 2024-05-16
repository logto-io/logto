---
"@logto/console": patch
---

improve error handling on audit logs

- No longer toasts error messages if the audit log related user entity has been removed.
- Display a fallback `user-id (deleted)` information instead.
