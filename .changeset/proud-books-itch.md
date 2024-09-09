---
"@logto/experience-legacy": minor
"@logto/experience": minor
---

allow link new social identity to an existing user account when registration is disabled.

### Previous behavior

Sign-in with a social identity that does not have an existing user account will throw an `identity_not_exist` error. When the registration is disabled, the error message will be shown, the user will not be able to create a new account or link the social identity to an existing account via verified email or phone number.

### Expected behavior

When the registration is disabled, if a related user account is found, the user should be able to link the social identity to an existing account via a verified email or phone number.

### Updates

When the registration is disabled:

- Show `identity_not_exist` error message if no related user account is found.
- Automatically link the social identity to the existing account if a related user account is found and social automatic account linking is enabled.
- Redirect the user to the social link account page if a related user account is found and social automatic account linking is disabled.
- Hide the register button on the social link account page if the registration is disabled.

When the registration is enabled:

- Automatically register a new account with the social identity if no related user account is found.
- Automatically link the social identity to the existing account if a related user account is found and social automatic account linking is enabled.
- Redirect the user to the social link account page if a related user account is found and social automatic account linking is disabled.
- Show the register new account button on the social link account page.
