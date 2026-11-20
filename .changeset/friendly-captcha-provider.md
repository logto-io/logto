---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/phrases": minor
---

support Friendly Captcha as a CAPTCHA provider

[Friendly Captcha](https://friendlycaptcha.com) v2 is a privacy-first, GDPR-compliant CAPTCHA service based on proof-of-work without visual puzzles.

To use it, create a v2 application and API key in the Friendly Captcha dashboard, then go to Console > Security > CAPTCHA and add Friendly Captcha with its site key and API key. The same configuration is available through the `PUT /api/captcha-provider` Management API with `type: "FriendlyCaptcha"`.

Customers on Friendly Captcha's Advanced or Enterprise plan can set the API endpoint to EU (`apiEndpoint: "eu"`) so that both the sign-in widget and token verification use Friendly Captcha's dedicated EU endpoint.
