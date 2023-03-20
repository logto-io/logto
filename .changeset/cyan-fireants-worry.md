---
"@logto/phrases-ui": minor
"@logto/ui": minor
---

### Update the password policy

Password policy description: Password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.

- min-length updates: Password requires a minimum of 8 characters
- allowed characters updates: Password contains a mix of letters, numbers, and symbols
  - digits: 0-9
  - letters: a-z, A-Z
  - symbols: !"#$%&'()\*+,./:;<=>?@[\]^\_`{|}~-
- At least two types of characters are required:
  - letters and digits
  - letters and symbols
  - digits and symbols

> notice: The new password policy is applied to new users or new passwords only. Existing users are not affected by this change, users may still use their old password to sign-in.
