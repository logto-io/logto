---
"@logto/console": patch
"@logto/core": patch
"@logto/schemas": patch
---

allow skipping mandatory sign-up identifier collection for social sign-in and sign-up

## Background

Previously, Logto enforced mandatory user identifier collection during both sign-in and sign-up flows. Users were required to provide all identifiers configured as mandatory in the sign-up settings. This behavior applies to all sign-in methods except for enterprise SSO.

For example:

1. A new user signs up via a GitHub social connector
2. The IdP does not provide a verified email address
3. Email is configured as a mandatory sign-up identifier in Logto
4. In this case, the user would be prompted to provide and verify an email address before the account could be successfully created.

## Problem

For iOS mobile app users, Apple App Store guidelines mandate social sign-in options like "Sign in with Apple" should not require additional information collection beyond what is provided by the social IdP. Enforcing additional identifier collection during social sign-in can result in app review rejection.

## Solution

We have updated the sign-in-experience settings with a new option `skipRequiredIdentifiers` for social sign-in and sign-up flows. When enabled, this option allows users to bypass the mandatory identifier collection step during social sign-in and sign-up.

By default, this option is set to `false` to maintain existing behavior. Administrators can enable this option in the sign-in experience settings if they wish to allow users to skip mandatory identifier collection during social sign-in and sign-up.

On Logto console, this option is represented as a checkbox labeled "Require users to provide missing sign-up identifier" on the sign-in experience configuration page under the "Social sign-in" section. Checked by default.
