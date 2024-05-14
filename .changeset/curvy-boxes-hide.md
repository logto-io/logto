---
"@logto/console": patch
"@logto/phrases": patch
---

replace the i18n translated hook event label with the hook event value directly in the console

- remove all the legacy interaction hook events i18n phrases
- replace the translated label with the hook event value directly in the console
  - `Create new account` -> `PostRegister`
  - `Sign in` -> `PostSignIn`
  - `Reset password` -> `PostResetPassword`
