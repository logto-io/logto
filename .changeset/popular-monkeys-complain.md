---
"@logto/experience": minor
"@logto/schemas": minor
"@logto/core": minor
---

add support for `login_hint` parameter in sign-in method

This feature allows you to provide a suggested identifier (email, phone, or username) for the user, improving the sign-in experience especially in scenarios where the user's identifier is known or can be inferred.

Example:

```javascript
// Example usage (React project using React SDK)
void signIn({
  redirectUri,
  loginHint: 'user@example.com',
  firstScreen: 'signIn', // or 'register'
});
```
