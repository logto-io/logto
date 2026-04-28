# WhatsApp SMS connector

Logto connector for WhatsApp using the Meta Cloud API.

**Table of contents**

- [WhatsApp SMS connector](#whatsapp-sms-connector)
  - [Get started](#get-started)
  - [Create a Meta Developer App](#create-a-meta-developer-app)
  - [Set up WhatsApp Business](#set-up-whatsapp-business)
  - [Create a System User and generate a permanent token](#create-a-system-user-and-generate-a-permanent-token)
  - [Create message templates](#create-message-templates)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test WhatsApp connector](#test-whatsapp-connector)
    - [Config types](#config-types)
  - [Reference](#reference)

## Get started

WhatsApp is one of the most widely used messaging platforms, especially in Latin America and other regions where SMS coverage can be unreliable or expensive. This connector allows Logto to send OTP verification codes via WhatsApp using the Meta Cloud API.

## Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com) and create a new app.
2. Select **Business** as the app type.
3. Add the **WhatsApp** product to your app.

## Set up WhatsApp Business

1. In your app dashboard, go to **WhatsApp → Getting Started**.
2. Note your **Phone Number ID** — you will need it for the connector configuration.
3. Add and verify the phone number you want to use for sending messages.

> ℹ️ **Tip**
>
> During development, Meta provides a free test phone number that you can use to send messages to up to 5 verified recipient numbers.

## Create a System User and generate a permanent token

Using a System User token is recommended over personal access tokens because it does not expire and is not tied to any individual user account.

1. Go to [Meta Business Manager](https://business.facebook.com) → **Settings → Users → System Users**.
2. Create a new System User with the **Admin** role.
3. Click **Add Assets** and assign:
   - Your Meta app (with full control)
   - Your WhatsApp Business account (with full control)
4. Click **Generate new token**, select your app, and enable the following permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Copy and save the generated token — this is your **System User Access Token**.

> ⚠️ **Important**
>
> This token does not expire. Store it securely and do not share it publicly.

## Create message templates

WhatsApp requires pre-approved message templates for sending OTP codes. You must create and get approval for templates before using the connector.

1. Go to [Meta Business Manager](https://business.facebook.com) → **WhatsApp Manager → Message templates**.
2. Create templates for each usage type. Use **Authentication** as the category.
3. The required templates are:

| Usage Type       | Suggested template name    |
|------------------|----------------------------|
| SignIn           | `logto_sign_in`            |
| Register         | `logto_register`           |
| ForgotPassword   | `logto_forgot_password`    |
| Generic          | `logto_generic`            |

> ℹ️ **Note**
>
> Authentication templates in Meta have a fixed body format. The OTP code is passed as a parameter and displayed automatically. You do not need to write the message body manually.

Wait for Meta to approve your templates before proceeding. Approval is usually instant for Authentication templates.

## Compose the connector JSON

Fill out the following fields in the connector configuration:

- **System User Access Token**: the permanent token generated in the previous step.
- **Phone Number ID**: the ID of your WhatsApp phone number from the Meta app dashboard.
- **Templates**: a JSON array mapping each usage type to its approved template name and language.

Example templates configuration:

```json
[
  {
    "usageType": "SignIn",
    "templateName": "logto_sign_in",
    "language": "en"
  },
  {
    "usageType": "Register",
    "templateName": "logto_register",
    "language": "en"
  },
  {
    "usageType": "ForgotPassword",
    "templateName": "logto_forgot_password",
    "language": "en"
  },
  {
    "usageType": "Generic",
    "templateName": "logto_generic",
    "language": "en"
  }
]
```

### Test WhatsApp connector

You can enter a phone number and click on "Send" to verify the settings before clicking "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/).

### Config types

| Name              | Type        | Description                                      |
|-------------------|-------------|--------------------------------------------------|
| accessToken       | string      | System User Access Token from Meta Business      |
| phoneNumberId     | string      | WhatsApp Phone Number ID from Meta app dashboard |
| templates         | Templates[] | Array of templates for each usage type           |

| Template Properties | Type        | Enum values                                                |
|---------------------|-------------|------------------------------------------------------------|
| usageType           | enum string | `Register` \| `SignIn` \| `ForgotPassword` \| `Generic`   |
| templateName        | string      | Approved template name in Meta WhatsApp Manager            |
| language            | string      | Language code (e.g. `en`, `es_AR`)                        |

## Reference

- [Meta Cloud API — Send Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages)
- [Meta — Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Meta Business Manager — System Users](https://developers.facebook.com/docs/business-management-apis/system-users)
