---
"@logto/core": minor
---

feat: enhanced user lookup by phone with phone number normalization.

In some countries, local phone numbers are often entered with a leading '0'. However, in the context of the international format this leading '0' should be stripped. E.g., +61 (0)2 1234 5678 should be normalized to +61 2 1234 5678.

In the previous implementation, Logto did not normalize the user's phone number during the user sign-up process. Both 61021345678 and 61212345678 were considered as valid phone numbers, and we do not normalize them before storing them in the database. This could lead to confusion when users try to sign-in with their phone numbers, as they may not remember the exact format they used during sign-up. Users may also end up with different accounts for the same phone number, depending on how they entered it during sign-up.

To address this issue, especially for legacy users, we have added a new enhenced user lookup by phone with either format (with or without leading '0') to the user sign-in process. This means that users can now sign-in with either format of their phone number, and Logto will try to match it with the one stored in the database, even if they might have different formats. This will help to reduce confusion and improve the user experience when logging in with phone numbers.

For example:

- If a user signs up with the phone number +61 2 1234 5678, they can now sign-in with either +61 2 1234 5678 or +61 02 1234 5678.
- The same applies to the phone number +61 02 1234 5678, which can be used to sign-in with either +61 2 1234 5678 or +61 02 1234 5678.

For users who might have created two different counts with the same phone number but different formats. The lookup process will always return the one with an exact match. This means that if a user has two accounts with the same phone number but different formats, they will still be able to sign-in with either format, but they will only be able to access the account that matches the format they used during sign-up.

For example:

- If a user has two accounts with the phone numbers +61 2 1234 5678 and +61 02 1234 5678. They will need to sign-in to each account using the exact format they used during sign-up.

related github issue [#7371](https://github.com/logto-io/logto/issues/7371).
