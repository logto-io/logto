# SMTP SMS connector

A custom Logto connector developed by **Service Vic** for sending SMS messages via an email-to-SMS SMTP gateway.

> ⚠️ This is **not** an official Logto connector. It is maintained by Service Vic.

## Get started

Many mobile carriers expose an **email-to-SMS gateway**: you send a plain-text email to `<phonenumber>@<carrier-gateway>` and the carrier delivers it to the subscriber's handset as an SMS. This connector leverages that mechanism by reusing an existing SMTP server to send SMS messages — no separate SMS API account required.

### Common carrier gateways (USA)

| Carrier   | Gateway address pattern          |
|-----------|----------------------------------|
| AT&T      | `number@txt.att.net`             |
| Verizon   | `number@vtext.com`               |
| T-Mobile  | `number@tmomail.net`             |
| Sprint    | `number@messaging.sprintpcs.com` |
| US Cellular | `number@email.uscc.net`        |

> ⚠️ **Note:** Email-to-SMS gateways are best suited for low-volume scenarios (e.g. internal tools, self-hosted deployments). For production workloads with many users, a dedicated SMS API provider (Twilio, AWS SNS, etc.) is recommended for better deliverability and reliability.

## Configuration

### SMTP connection

Configure the same SMTP settings you would use for email:

| Field             | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| `host`            | SMTP server hostname                                               |
| `port`            | SMTP server port (typically 587 for STARTTLS, 465 for TLS)        |
| `auth`            | Authentication credentials (login or OAuth2)                       |
| `secure`          | Set to `true` for port 465 (implicit TLS)                         |

### SMS-specific settings

| Field             | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| `fromEmail`       | The sender email address                                           |
| `toEmailTemplate` | Template for the recipient gateway address (see below)            |
| `subject`         | Optional email subject (most gateways ignore it)                  |
| `templates`       | Message templates per usage type                                  |

### `toEmailTemplate` placeholders

| Placeholder         | Value                                      | Example          |
|---------------------|--------------------------------------------|------------------|
| `{{phone}}`         | Phone number as received (e.g. +12025551234) | `+12025551234` |
| `{{phoneNumberOnly}}` | Digits only (non-numeric chars stripped) | `12025551234`  |

**Example for AT&T (USA):**

```
{{phoneNumberOnly}}@txt.att.net
```

**Example for a custom gateway that accepts the E.164 number:**

```
{{phone}}@sms.mygateway.example.com
```

### `templates` format

Each entry in `templates` must contain:

- `usageType` – one of `Register`, `SignIn`, `ForgotPassword`, `Generic` (and optionally `OrganizationInvitation`, `MfaVerification`, etc.)
- `content` – the SMS body; use `{{code}}` as the placeholder for the verification code

**Minimum required template example:**

```json
[
  { "usageType": "SignIn",         "content": "Your sign-in code is {{code}}. Expires in 10 minutes." },
  { "usageType": "Register",       "content": "Your sign-up code is {{code}}. Expires in 10 minutes." },
  { "usageType": "ForgotPassword", "content": "Your password reset code is {{code}}. Expires in 10 minutes." },
  { "usageType": "Generic",        "content": "Your verification code is {{code}}. Expires in 10 minutes." }
]
```

## Full configuration example

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "auth": {
    "type": "login",
    "user": "notifications@example.com",
    "pass": "s3cr3t"
  },
  "fromEmail": "notifications@example.com",
  "toEmailTemplate": "{{phoneNumberOnly}}@txt.att.net",
  "subject": "Verification Code",
  "secure": false,
  "templates": [
    { "usageType": "SignIn",         "content": "Your Logto sign-in code is {{code}}. Expires in 10 minutes." },
    { "usageType": "Register",       "content": "Your Logto sign-up code is {{code}}. Expires in 10 minutes." },
    { "usageType": "ForgotPassword", "content": "Your Logto password reset code is {{code}}. Expires in 10 minutes." },
    { "usageType": "Generic",        "content": "Your Logto verification code is {{code}}. Expires in 10 minutes." }
  ]
}
```
