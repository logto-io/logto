---
"@logto/connector-apple": patch
---

clarify that the Apple connector's identifier is a Services ID

The connector's identifier field is now labeled "Services ID" and states that an App ID (bundle ID) is not a valid value, which Apple rejects with an `invalid_client` error.

Setup instructions cover the Apple Developer portal, so enabling Sign in with Apple no longer appears to require Xcode. Troubleshooting guidance explains `invalid_client` and `invalid_request`, including Apple's caching of identifier configuration, which has been observed to take up to 24 hours to refresh and can make a correct configuration look broken.
