# MailJunky email connector

The Logto connector for [MailJunky](https://www.mailjunky.ai) — transactional email with optional AI workflows and event tracking. Logto uses MailJunky’s HTTP API to send verification codes, password resets, magic links, and other auth-related messages.

**Table of contents**

- [MailJunky email connector](#mailjunky-email-connector)
  - [Get started](#get-started)
  - [Prerequisites](#prerequisites)
  - [Configure your connector](#configure-your-connector)
  - [Templates](#templates)
  - [Test the connector](#test-the-connector)
  - [Config types](#config-types)

## Get started

1. Create a MailJunky account at [mailjunky.ai](https://www.mailjunky.ai).
2. Verify your sending domain (required for reliable delivery).
3. Create an API key with permission to send email.
4. Add this connector in the Logto Console and paste your configuration.

API reference: [MailJunky documentation](https://www.mailjunky.ai/docs).

## Prerequisites

- **API key** — Used as `Authorization: Bearer <apiKey>` when calling `POST https://mailjunky.ai/api/v1/emails/send`.
- **From email / name** — Must align with a verified sender or domain in MailJunky. The connector sends a `from` field built from `fromEmail` and optional `fromName` (RFC-style `Name <email>` when `fromName` is set).

## Configure your connector

| Field       | Description |
|------------|-------------|
| `apiKey`   | MailJunky API key (`mj_live_...` or `mj_test_...`). |
| `fromEmail`| Verified sender email address. |
| `fromName` | Optional display name for the `From` header. |
| `templates`| JSON array of templates (see below). |

At minimum, templates with `usageType` **`Register`**, **`SignIn`**, **`ForgotPassword`**, and **`Generic`** are required.

## Templates

Each template object supports:

| Property    | Description |
|------------|-------------|
| `usageType`| One of Logto template types, e.g. `SignIn`, `Register`, `ForgotPassword`, `Generic`, `OrganizationInvitation`, … |
| `subject`  | Email subject; supports Handlebars (e.g. `{{code}}`, `{{link}}`). |
| `content`  | Body; HTML or plain text; supports Handlebars placeholders. |

If no template exists for a given flow, Logto falls back to the **`Generic`** template.

Example `templates` JSON:

```jsonc
[
  {
    "usageType": "Register",
    "subject": "Verify your email",
    "content": "Your verification code is {{code}}."
  },
  {
    "usageType": "SignIn",
    "subject": "Sign-in code",
    "content": "Your sign-in code is {{code}}."
  },
  {
    "usageType": "ForgotPassword",
    "subject": "Reset your password",
    "content": "Your reset code is {{code}}."
  },
  {
    "usageType": "Generic",
    "subject": "Verification code",
    "content": "Your code is {{code}}."
  }
]
```

The connector renders `subject` and `content`, then sends JSON including `from`, `to`, `subject`, `html`, and `text` (plain text is derived from the HTML content when the body contains tags).

## Test the connector

Use the **Send** test in the connector detail page with a real inbox you can access. Then enable the connector in [Sign-in experience → Connectors](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/).

## Config types

| Name        | Type |
|-------------|------|
| `apiKey`    | string |
| `fromEmail` | string |
| `fromName`  | string (optional) |
| `templates` | `Template[]` |

| Template properties | Type   |
|---------------------|--------|
| `usageType`         | string |
| `subject`           | string |
| `content`           | string |
