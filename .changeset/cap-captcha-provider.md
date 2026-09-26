---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/phrases": minor
---

support Cap as a self-hosted CAPTCHA provider

[Cap](https://capjs.js.org) is an open-source, self-hosted proof-of-work CAPTCHA. It needs no third-party service, so bot protection keeps working in regions where Cloudflare Turnstile and Google reCAPTCHA are unreachable or unreliable.

To use it, deploy a publicly reachable [Cap Standalone](https://capjs.js.org/guide/standalone/) instance, create a site key, then go to Console > Security > CAPTCHA and add Cap with the instance endpoint, site key, and secret key. The same configuration is available through the `PUT /api/captcha-provider` Management API with `type: "Cap"`.

While Cap is the CAPTCHA provider, the sign-in page's Content Security Policy allows the Cap instance and dynamic JavaScript evaluation, which Cap's bot-detection (instrumentation) challenge requires.
