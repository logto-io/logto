---
"@logto/core": minor
---

block third-party applications from mutating account data through the Account API and Verification API

The Account API is the user managing their own account at the identity provider, and was built for the first-party Account Center.

Third-party applications now receive `403 auth.third_party_application_forbidden` when they try to change account data. Reads are unchanged, and so is every first-party application, including Account Center and Console.
