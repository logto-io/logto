---
"@logto/core": minor
---

Add avatar/image upload APIs for end users.

- `POST /api/my-account/user-assets` and `GET /api/my-account/user-assets/service-status` allow authenticated users to upload an image (e.g. avatar) via the Account API. Guarded by the `profile` scope and the account center `avatar` field control.
- `POST /api/experience/profile/avatar` allows uploading an image during the register experience interaction, scoped to the current interaction session.

Both endpoints return the uploaded asset URL and do not write to `users.avatar` automatically; callers are expected to update the avatar field separately.
