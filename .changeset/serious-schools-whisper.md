---
"@logto/console": minor
---

add third-party application management pages

- Add the new application category `Third-party` to the application creation page.
- Add the new application framework `OIDC IdP` to the application creation page.
- Add new tab `Third-party apps` to the applications management page. Split the existing applications list into `My apps` and `Third-party apps` two different tab for better management.
- Reorg the application details page form. Remove the `Advance settings` tab and merge all the OIDC configuration fields into the `Settings` tab.
- Add new `Permissions` tab to the third-party application details page. Display the user consent resource, organization, and user scopes. And allow the user to manage the user granted organizations for the third-party application.
- Add new `Branding` tab to the third-party application details page. Allow the user to manage the application level sign-in experiences for the third-party application.
