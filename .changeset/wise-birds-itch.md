---
"@logto/schemas": minor
---

Add single sign-on (SSO) table and schema definitions

- Add new sso_connectors table, which is used to store the SSO connector data.
- Add new user_sso_identities table, which is used to store the user's SSO identity data received from IdP through a SSO interaction.
- Add new single_sign_on_enabled column to the sign_in_experiences table, which is used to indicate if the SSO feature is enabled for the sign-in experience.
- Define new SSO feature related types
