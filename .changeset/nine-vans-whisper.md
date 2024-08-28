---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/core": minor
---

add support for additional first screen options

This feature introduces new first screen options, allowing developers to customize the initial screen presented to users. In addition to the existing `sign_in` and `register` options, the following first screen choices are now supported:

- `identifier:sign_in`:  Only display specific identifier-based sign-in methods to users.
- `identifier:register`: Only display specific identifier-based registration methods to users.
- `reset_password`: Allow users to directly access the password reset page.
- `single_sign_on`: Allow users to directly access the single sign-on (SSO) page.

Example:

```javascript
// Example usage (React project using React SDK)
void signIn({
  redirectUri,
  firstScreen: 'identifier:sign_in',
  /**
  * Optional. Specifies which sign-in methods to display on the identifier sign-in page.
  * If not specified, the default sign-in experience configuration will be used.
  * This option is effective when the `firstScreen` value is `identifier:sign_in`, `identifier:register`, or `reset_password`.
  */
  identifiers: ['email', 'phone'],
});
```
