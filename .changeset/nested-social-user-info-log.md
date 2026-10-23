---
"@logto/core": patch
---

nest the social user info under `userInfo` in the `Interaction.SignIn.Identifier.Social.Submit` audit log of the deprecated interaction API

This only affects social sign-in through the deprecated `/api/interaction` endpoints; the current experience API (`/api/experience`) is unchanged. The change is precautionary: connector profile fields were spread at the top level of that log's payload, so a connector that returns its own `userId` (for example Feishu's employee user ID) could replace the Logto user ID on that entry. Queries that read this entry's profile fields need to read them from `payload.userInfo` instead.
