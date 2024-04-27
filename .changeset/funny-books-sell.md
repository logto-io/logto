---
"@logto/experience": patch
---

fix native social sign-in callback

In a native environment, the social sign-in callback that posts to the native container (e.g. WKWebView in iOS) was wrong.

This was introduced by a refactor in #5536: It updated the callback path from `/sign-in/social/:connectorId` to `/callback/social/:connectorId`. However, the function to post the message to the native container was not updated accordingly.
