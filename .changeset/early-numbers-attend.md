---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
---

add `trustUnverifiedEmail` setting for the Microsoft EntraID OIDC SSO connector

Since we launched the **EntraID OIDC SSO connector** we have received several feedbacks that their customer's email address can not be populated to Logto's user profile when signing up through the EntraID OIDC SSO connector.
This is because Logto only syncs verified email addresses, meaning the `email_verified` claim must be `true` in the user info response from the OIDC provider.

However, based on Microsoft's documentation, since the user's email address in manually managed by the organization, they are not verified guaranteed. This means that the `email_verified` claim will not be included in their user info response.

To address this issue, we have added a new `trustUnverifiedEmail` exclusively for the Microsoft EntraID OIDC SSO connector. When this setting is enabled, Logto will trust the email address provided by the Microsoft EntraID OIDC SSO connector even if the `email_verified` claim is not included in the user info response. This will allow users to sign up and log in to Logto using their email address without any issues. Please note this may introduce a security risk as the email address is not verified by the OIDC provider. You should only enable this setting if you trust the email address provided by the Microsoft EntraID OIDC SSO connector.

You can configure this setting in the **EntraID OIDC SSO connector** settings page in the Logto console or through the management API.
