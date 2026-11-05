---
"@logto/connector-sendgrid-email": patch
---

honor `sendFrom` and `replyTo` of the i18n email template

With a custom i18n template, the SendGrid connector put the configured sender name on the recipient and dropped it from `from`, and ignored the template's `replyTo`. The recipient is now addressed by email only, `from.name` comes from the template's `sendFrom` (falling back to the configured `fromName`), and `reply_to` is set from the template's `replyTo`.
