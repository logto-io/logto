---
"@logto/core": patch
"@logto/console": patch
---

drop deleted profile fields from account center and sign-up configs on save

When a custom profile field is removed from Collect user profile, saving Account Center (or sign-up) settings no longer fails with `custom_profile_fields.entity_not_exists_with_names`. Stale field references are ignored on save, and deleted fields remain removable in the Console editor even when their permission control is Off.
