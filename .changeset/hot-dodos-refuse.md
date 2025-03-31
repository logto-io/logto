---
"@logto/schemas": minor
"@logto/core": minor
"@logto/console": minor
"@logto/experience": minor
---

feat: support multiple sign-up identifiers in sign-in experience

## New update

Introduces a new optional field, `secondaryIdentifiers`, to the sign-in experience sign-up settings. This enhancement allows developers to specify multiple required user identifiers during the user sign-up process. Available options include `email`, `phone`, `username` and `emailOrPhone`.

### Explanation of the difference between `signUp.identifiers` and new `signUp.secondaryIdentifiers`

The existing `signUp.identifiers` field represents the sign-up identifiers enabled for user sign-up and is an array type. In this legacy setup, if multiple identifiers are provided, users can complete the sign-up process using any one of them. The only multi-value case allowed is `[email, phone]`, which signifies that users can provide either an email or a phone number.

To enhance flexibility and support multiple required sign-up identifiers, the existing `signUp.identifiers` field does not suffice. To maintain backward compatibility with existing data, we have introduced this new `secondaryIdentifiers` field.

Unlike the `signUp.identifiers` field, the `signUp.secondaryIdentifiers` array follows an `AND` logic, meaning that all elements listed in this field are required during the sign-up process, in addition to the primary identifiers. This new field also accommodates the `emailOrPhone` case by defining an exclusive `emailOrPhone` value type, which indicates that either a phone number or an email address must be provided.

In summary, while `identifiers` allows for optional selection among email and phone, `secondaryIdentifiers` enforces mandatory inclusion of all specified identifiers.

### Examples

1. `username` as the primary identifier. In addition, user will be required to provide a verified `email` and `phone number` during the sign-up process.

```json
{
  "identifiers": ["username"],
  "secondaryIdentifiers": [
    {
      "type": "email",
      "verify": true
    },
    {
      "type": "phone",
      "verify": true
    }
  ],
  "verify": true,
  "password": true
}
```

2. `username` as the primary identifier. In addition, user will be required to provide either a verified `email` or `phone number` during the sign-up process.

```json
{
  "identifiers": ["username"],
  "secondaryIdentifiers": [
    {
      "type": "emailOrPhone",
      "verify": true
    }
  ],
  "verify": true,
  "password": true
}
```

3. `email` or `phone number` as the primary identifier. In addition, user will be required to provide a `username` during the sign-up process.

```json
{
  "identifiers": ["email", "phone"],
  "secondaryIdentifiers": [
    {
      "type": "username",
      "verify": true
    }
  ],
  "verify": true,
  "password": false
}
```

### Sign-in experience settings

- `@logto/core`: Update the `/api/sign-in-experience` endpoint to support the new `secondaryIdentifiers` field in the sign-up settings.
- `@logto/console`: Replace the sign-up identifier single selector with a multi-selector to support multiple sign-up identifiers. The order of the identifiers can be rearranged by dragging and dropping the items in the list. The first item in the list will be considered the primary identifier and stored in the `signUp.identifiers` field, while the rest will be stored in the `signUp.secondaryIdentifiers` field.

### End-user experience

The sign-up flow is now split into two stages:

- Primary identifiers (`signUp.identifiers`) are collected in the first-screen registration screen.
- Secondary identifiers (`signUp.secondaryIdentifiers`) are requested in subsequent steps after the primary registration has been submitted.

## Other refactors

We have fully decoupled the sign-up identifier settings from the sign-in methods. Developers can now require as many user identifiers as needed during the sign-up process without impacting the sign-in process.

The following restrictions on sign-in and sign-up settings have been removed:

1. Password requirement is now optional when `username` is configured as a sign-up identifier. However, users without passwords cannot sign in using username authentication.

2. Removed the constraint requiring sign-up identifiers to be enabled as sign-in methods.

3. Removed the requirement for password verification across all sign-in methods when password is enabled for sign-up.
