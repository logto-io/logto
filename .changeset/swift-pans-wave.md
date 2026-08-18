---
"@logto/experience": patch
---

validate the URL scheme of the social sign-in redirect target and native callback link

The social landing page now requires `redirect_to` to be an `http(s)` URL, and accepts a native
callback link only when it is a custom app scheme. The callback page re-checks the stored link
before handing control back to the native app, and falls back to the web flow otherwise.
