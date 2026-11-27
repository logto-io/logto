---
"@logto/connector-mailjunky": patch
---

honor `replyTo` of the i18n email template

With a custom i18n email template, the MailJunky connector ignored the template's `replyTo`. It now sends it (with handlebars replaced) as `reply_to`, like the SMTP and SendGrid connectors; without it, the behavior is unchanged.
