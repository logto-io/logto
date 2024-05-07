---
"@logto/connector-github": minor
---

fetch GitHub account's private email address list and pick the verified primary email as a fallback

- Add `user:email` as part of default scope to fetch GitHub account's private email address list
- Pick the verified primary email among private email address list as a fallback if the user does not set a public email for GitHub account
