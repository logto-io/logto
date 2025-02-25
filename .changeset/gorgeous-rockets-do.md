---
"@logto/core": minor
"@logto/connector-aliyun-dm": minor
"@logto/connector-aws-ses": minor
"@logto/connector-mailgun": minor
"@logto/connector-sendgrid-email": minor
"@logto/connector-smtp": minor
---

add customizing email templates in multiple languages via Management API.

## Details

Introduce localized email template customization capabilities. This update allows administrators to create and manage multiple email templates for different languages and template types (e.g., SignIn, ForgotPassword) via the management API.

Email connectors now support automatic template selection based on the user's preferred language. If a template is not available in the user's preferred language, the default template will be used.

- For client-side API requests, like experience API and user account API, the user's preferred language is determined by the `Accept-Language` header.
- For server-side API requests, like organization invitation API, email language preference can be set by passing extra `locale` parameter in the `messagePayload`.
- The email template selection logic is based on the following priority order:
  1. Find the template that matches the user's preferred language detected from the request.
  2. Find the template that matches the default language set in the sign-in experience settings.
  3. Use the default template set in the email connector settings.

### Management API

- `PUT /email-templates`: Bulk create or update email templates.
- `GET /email-templates`: List all email templates with filter by language and type support.
- `DELETE /email-templates`: Bulk delete email templates by language and type.
- `GET /email-templates/{id}`: Get a specific email template by ID.
- `DELETE /email-templates/{id}`: Delete a specific email template by ID.
- `PATCH /email-templates/{id}/details`: Update email template details by ID.

### Supported email connectors

- `@logto/connector-aliyun-dm`
- `@logto/connector-aws-ses`
- `@logto/connector-mailgun`
- `@logto/connector-sendgrid-email`
- `@logto/connector-smtp`

### Unsupported email connectors

The following email connectors have their templates managed at the provider side and do not support reading templates from Logto.
The user's preferred language will be passed to the provider as the `locale` parameter in the email sending request payload. For i18n support, administrators must manage the template selection logic at the provider side.

- `@logto/connector-postmark`
- `@logto/connector-http-email`
