---
'@logto/experience': patch
---

let browsers suggest a strong password when setting a new password

The sign-in experience keeps a hidden copy of the identifier next to the new password field so password managers can save the credential under the right account. That field carried no `autocomplete` hint and was hidden with the HTML `hidden` attribute, which browsers skip when they look for the username context of a password field. As a result, Safari on iOS and macOS never offered to generate a strong password on the "Set password" step. The field is now marked as the username and hidden visually instead, and it carries the identifier the user actually entered in the current flow, including when resetting a password.
