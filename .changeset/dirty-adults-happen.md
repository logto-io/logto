---
"@logto/console": patch
---

fix redirect URI mismatches caused by the Console decoding URIs on save

The Console percent-decoded redirect URIs and post sign-out redirect URIs when saving application settings, so `https://example.com/a%2Fb` was stored as `https://example.com/a/b` and no longer matched the URI sent by the client. These URIs are now saved exactly as entered.

CORS allowed origins are no longer percent-decoded either, and a literal `%` in any of these fields, such as `https://example.com/100%`, no longer causes the save to fail. Trailing slashes are still removed from CORS allowed origins.
