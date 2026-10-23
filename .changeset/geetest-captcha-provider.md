---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/phrases": minor
---

support GeeTest as a CAPTCHA provider

[GeeTest](https://www.geetest.com) CAPTCHA v4 adds an adaptive CAPTCHA service with localized challenges, which suits sign-in experiences targeting mainland China where Google reCAPTCHA is often unreachable.

To use it, create a CAPTCHA v4 event in the GeeTest dashboard, then go to Console > Security > CAPTCHA and add GeeTest with its CAPTCHA ID and CAPTCHA key. The same configuration is available through the `PUT /api/captcha-provider` Management API with `type: "Geetest"`.

While GeeTest is the CAPTCHA provider, the sign-in page's Content Security Policy allows GeeTest's SDK, API, and static hosts, which the widget loads the challenge from.
