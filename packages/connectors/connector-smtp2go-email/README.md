# SMTP2GO email connector

The official Logto connector for SMTP2GO email service.

**Table of contents**

- [SMTP2GO email connector](#smtp2go-email-connector)
  - [Get started](#get-started)
  - [Register SMTP2GO account](#register-smtp2go-account)
  - [Verify senders](#verify-senders)
  - [Create API keys](#create-api-keys)
  - [Configure your connector](#configure-your-connector)
    - [Test SMTP2GO email connector](#test-smtp2go-email-connector)
    - [Config types](#config-types)

## Get started

SMTP2GO is a reliable email delivery service for transactional and marketing emails. We can use its email sending function to send _verification codes_.

## Register SMTP2GO account

Create a new account at [SMTP2GO website](https://www.smtp2go.com/). You may skip this step if you've already got an account.

## Verify senders

Go to the [SMTP2GO dashboard](https://app.smtp2go.com/) and sign in with your SMTP2GO account.

Senders indicate the addresses our verification code email will be sent from. In order to send emails via SMTP2GO, you need to verify at least one sender email address or domain.

From the SMTP2GO dashboard, navigate to **Settings → Sender Domains** or **Settings → Verified Senders**.

**Domain Verification (Recommended):**
- Click "Add Domain" and follow the instructions to verify your entire domain
- You'll need to add DNS records (SPF, DKIM) to your domain
- This allows you to send from any email address on that domain

**Single Sender Verification:**
- Click "Add Verified Sender"
- Enter the email address you want to send from
- SMTP2GO will send a verification email to that address
- Click the verification link in the email to complete the process

## Create API keys

From the [SMTP2GO dashboard](https://app.smtp2go.com/), navigate to **Settings → API Keys**.

Click **Add API Key** button:
1. Give your API key a descriptive name (e.g., "Logto Production")
2. Select the appropriate permissions (at minimum, "Send Email" permission is required)
3. Click "Create"

**Important:** The API key will be shown only once. Copy it immediately and store it securely.

## Configure your connector

Fill out the `apiKey` field with the API Key created in the "Create API keys" section.

Fill out the `sender` field with your verified sender email address (e.g., `noreply@yourdomain.com`).

Fill out the `senderName` field with a friendly name that will appear as the sender (e.g., "Logto"). This field is OPTIONAL.

You can add multiple SMTP2GO email connector templates for different cases. Here is an example of adding a single template:

- Fill out the `subject` field, which works as the title of emails.
- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave placeholders like `{{code}}` for the random verification code.
- Fill out `usageType` field with either `Register`, `SignIn`, `ForgotPassword`, `Generic` for different use cases.
- Fill out `type` field with either `text/plain` or `text/html` for different types of content.

In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required.

Here is an example of SMTP2GO connector template JSON:

```jsonc
[
    {
        "subject": "Welcome to Logto - Verify Your Account",
        "content": "Your verification code is {{code}}. This code will expire in 10 minutes.",
        "usageType": "Register",
        "type": "text/plain"
    },
    {
        "subject": "Sign in to Logto",
        "content": "Your sign-in verification code is {{code}}. This code will expire in 10 minutes.",
        "usageType": "SignIn",
        "type": "text/plain"
    },
    {
        "subject": "Reset Your Logto Password",
        "content": "Your password reset code is {{code}}. This code will expire in 10 minutes.",
        "usageType": "ForgotPassword",
        "type": "text/plain"
    },
    {
        "subject": "Logto Verification Code",
        "content": "Your verification code is {{code}}. This code will expire in 10 minutes.",
        "usageType": "Generic",
        "type": "text/plain"
    }
]
```

### Test SMTP2GO email connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/)

### Config types

| Name       | Type              |
|------------|-------------------|
| apiKey     | string            |
| sender     | string            |
| senderName | string (OPTIONAL) |
| templates  | Template[]        |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| type                | enum string | 'text/plain' \| 'text/html'                          |
