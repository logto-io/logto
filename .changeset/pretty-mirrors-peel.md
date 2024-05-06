---
"@logto/connector-github": minor
---

Add email address fallback logic:
- We add `user:email` as default scope to fetch GitHub account's private email address.
- If the user does not choose a public email for he's GitHub account, we will pick the verified primary email among private email address list as a fallback.
