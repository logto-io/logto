---
"@logto/experience-legacy": minor
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
---

new MFA prompt policy

You can now cutomize the MFA prompt policy in the Console.

First, choose if you want to enable **Require MFA**:

- **Enable**: Users will be prompted to set up MFA during the sign-in process which cannot be skipped. If the user fails to set up MFA or deletes their MFA settings, they will be locked out of their account until they set up MFA again.
- **Disable**: Users can skip the MFA setup process during sign-up flow.

If you choose to **Disable**, you can choose the MFA setup prompt:

- Do not ask users to set up MFA.
- Ask users to set up MFA during registration (skippable, one-time prompt). **The same prompt as previous policy (UserControlled)**
- Ask users to set up MFA on their sign-in after registration (skippable, one-time prompt)
