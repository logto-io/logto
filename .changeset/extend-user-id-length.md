---
"@logto/schemas": minor
"@logto/core": minor
---

allow user IDs up to 128 characters

`users.id` and every column referencing it were limited to 12 or 21 characters. They now accept up to 128 characters, so users migrated from another identity provider can keep their original IDs.
