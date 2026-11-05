---
"@logto/connector-aws-ses": patch
---

honor `sendFrom` and `replyTo` of the i18n email template

With a custom i18n email template, the AWS SES connector always sent from the configured `emailAddress` and ignored the template's `sendFrom` and `replyTo`. It now uses them (with handlebars replaced), like the SMTP and SendGrid connectors; without them, the behavior is unchanged.
