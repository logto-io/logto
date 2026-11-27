---
"@logto/connector-twilio-sms": patch
"@logto/connector-postmark": patch
"@logto/connector-whatsapp-sms": patch
"@logto/connector-yunpian-sms": patch
"@logto/connector-gatewayapi-sms": patch
"@logto/connector-http-email": patch
"@logto/connector-http-sms": patch
"@logto/connector-saml": patch
---

hide credential text fields by default in Console connector configuration forms

Mark `authToken` (Twilio), `serverToken` (Postmark), `accessToken` (WhatsApp), `apikey` (Yunpian), `apiToken` (GatewayAPI), `authorization` (HTTP Email and HTTP SMS), and SAML private key password fields as confidential so they are masked by default in the Console UI.
