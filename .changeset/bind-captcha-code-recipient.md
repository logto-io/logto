---
"@logto/core": patch
---

limit the verification code recipients a solved captcha covers

When the captcha policy is enabled, a solved captcha used to cover every verification code sent from the same experience interaction, so a script could solve one captcha and then send codes to any number of phone numbers or email addresses (SMS pumping). A solved captcha now covers at most two recipients whose code has not been verified yet. Resending to a covered recipient keeps working (still capped by the per-recipient message rate limit), and a recipient stops counting once its code is verified, so flows that verify several identifiers are unaffected. Sending a code to one more unverified recipient returns `session.captcha_required` until a new captcha is solved; the built-in sign-in experience already solves a new captcha before sending a code from the sign-in, registration and forgot-password forms.
