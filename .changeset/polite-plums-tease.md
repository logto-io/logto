---
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/integration-tests": patch
---

support app-level branding

You can now set logos, favicons, and colors for your app. These settings will be used in the sign-in experience when the app initiates the authentication flow. For apps that have no branding settings, the omni sign-in experience branding will be used.

If `organization_id` is provided in the authentication request, the app-level branding settings will be overridden by the organization's branding settings, if available.
