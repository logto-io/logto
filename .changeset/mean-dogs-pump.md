---
"@logto/experience": patch
"@logto/console": patch
"@logto/phrases": patch
---

allow skipping manual account linking during sign-in

You can find this configuration in Console -> Sign-in experience -> Sign-up and sign-in -> Social sign-in -> Automatic account linking.

When switched on, if a user signs in with a social identity that is new to the system, and there is exactly one existing account with the same identifier (e.g., email), Logto will automatically link the account with the social identity instead of prompting the user for account linking.
