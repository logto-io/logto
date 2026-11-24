---
"@logto/connector-aliyun-dm": patch
---

honor `replyTo` of the i18n email template

With a custom i18n email template, the Aliyun Direct Mail connector always sent `ReplyToAddress: 'false'` and ignored the template's `replyTo`. It now sends the rendered address as `ReplyAddress` (with handlebars replaced) when it is a valid email, like the SMTP, SendGrid and AWS SES connectors; otherwise the behavior is unchanged.
