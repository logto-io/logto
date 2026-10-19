---
"@logto/connector-kit": minor
"@logto/connector-oauth": patch
"@logto/connector-oidc": patch
---

accept token responses that return `scope` as an array

Some providers, such as Twitch, return `scope` in the token response as a JSON array instead of a space-delimited string. Social sign-in with the generic OAuth 2.0 and OIDC connectors no longer fails with an invalid response error for these providers; the scopes are normalized to a space-delimited string.
