---
"@logto/experience": patch
---

fix: require terms agreement when the sign-in flow turns into a registration

When the agreement policy is `ManualRegistrationOnly` ("Require checkbox agreement on registration only"), signing in with an unregistered email or phone and then confirming "create a new account" used to create the account without ever asking the user to agree to the terms. The terms agreement is now prompted before the account is created on this path, matching the dedicated registration form and the social/SSO registration flows.
