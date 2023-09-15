---
"@logto/schemas": minor
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
"@logto/core-kit": minor
"@logto/experience": minor
---

feature: password policy

### Summary

This feature enables custom password policy for users. Now it is possible to guard with the following rules when a user is creating a new password:

- Minimum length (default: `8`)
- Minimum character types (default: `1`)
- If the password has been pwned (default: `true`)
- If the password is exactly the same as or made up of the restricted phrases:
  - Repetitive or sequential characters (default: `true`)
  - User information (default: `true`)
  - Custom words (default: `[]`)

If you are an existing Logto Cloud user or upgrading from a previous version, to ensure a smooth experience, we'll keep the original policy as much as possible:

> The original password policy requires a minimum length of 8 and at least 2 character types (letters, numbers, and symbols).

Note in the new policy implementation, it is not possible to combine lower and upper case letters into one character type. So the original password policy will be translated into the following:

- Minimum length: `8`
- Minimum character types: `2`
- Pwned: `false`
- Repetitive or sequential characters: `false`
- User information: `false`
- Custom words: `[]`

If you want to change the policy, you can do it:

- Logto Console -> Sign-in experience -> Password policy.
- Update `passwordPolicy` property in the sign-in experience via Management API.

### Side effects

- All new users will be affected by the new policy immediately.
- Existing users will not be affected by the new policy until they change their password.
- We removed password restrictions when adding or updating a user via Management API.
