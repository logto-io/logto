---
"@logto/connector-kit": major
---

update `SocialUserInfo` and `GetUserInfo` types

- Added `rawData?: Json` to `SocialUserInfo`
- `GetUserInfo` now does not accept unknown keys in the return object, since the raw data is now stored in `SocialUserInfo`
