# @logto/connector-aws-ses

## 1.5.1

### Patch Changes

- 462e430445: fall back to `TemplateType.Generic` if a usage-specific template is not found
- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 1.5.0

### Minor Changes

- 1fb8593659: add full usage types to templates default value

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 1.4.1

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 1.4.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 1.3.0

### Minor Changes

- 03ea1f96c: feat: custom email templates in multiple languages via Management API

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

### Patch Changes

- Updated dependencies [b0135bcd3]
  - @logto/connector-kit@4.2.0

## 1.2.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1

## 1.2.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

## 1.1.2

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0

## 1.1.1

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0

## 1.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

- 570a4ea9e: support subject handlebars

### Patch Changes

- 570a4ea9e: support `TemplateType`
- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/connector-kit@2.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [d24aaedf5]
  - @logto/connector-kit@2.0.0

## 1.0.1

### Patch Changes

- 046a5771b: fix `crypto.getRandomValues` undefined error (#3744)
