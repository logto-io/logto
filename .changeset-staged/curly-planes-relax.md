---
"@logto/ui": patch
---

## Implement a lite version of set password form.

To simplify the effort when user set new password, we implement a lite version of set password form.

The lite version of set password form only contains only one field password. It will be used if and only if the forgot-password feature is enabled (password can be reset either by email and phone).

If you do not have any email or sms service enabled, we still use the old version of set password form which contains two fields: password and confirm password.
