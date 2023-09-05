# Microsoft Azure AD connector

The Microsoft Azure AD connector provides a succinct way for your application to use Azure’s OAuth 2.0 authentication system.

**Table of contents**
- [Microsoft Azure AD connector](#microsoft-azure-ad-connector)
  - [Set up Microsoft Azure AD in the Azure Portal](#set-up-microsoft-azure-ad-in-the-azure-portal)
  - [Fill in the configuration](#fill-in-the-configuration)
  - [Configure your client secret](#configure-your-client-secret)
  - [Config types](#config-types)
  - [References](#references)

## Set up Microsoft Azure AD in the Azure Portal

- Visit the [Azure Portal](https://portal.azure.com/#home) and sign in with your Azure account. You need to have an active subscription to access Microsoft Azure AD.
- Click the **Azure Active Directory** from the services they offer, and click the **App Registrations** from the left menu.
- Click **New Registration** at the top and enter a description, select your **access type** and add your **Redirect URI**, which redirect the user to the application after logging in. In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. (The `connector_id` can be also found on the top bar of the Logto Admin Console connector details page)
- You need to select Web as Platform.
  - If you select **Sign in users of a specific organization only** for access type then you need to enter **TenantID**.
  - If you select **Sign in users with work and school accounts or personal Microsoft accounts** for access type then you need to enter **common**.
  - If you select **Sign in users with work and school accounts** for access type then you need to enter **organizations**.
  - If you select **Sign in users with personal Microsoft accounts (MSA) only** for access type then you need to enter **consumers**.

> You can copy the `Callback URI` in the configuration section.

## Fill in the configuration

In details page of the newly registered app, you can find the **Application (client) ID** and **Directory (tenant) ID**.

For **Cloud Instance**, usually it is `https://login.microsoftonline.com/`. See [Azure AD authentication endpoints](https://learn.microsoft.com/en-us/azure/active-directory/develop/authentication-national-cloud#azure-ad-authentication-endpoints) for more information.

## Configure your client secret
- In your newly created application, click the **Certificates & Secrets** to get a client secret, and click the **New client secret** from the top.
- Enter a description and an expiration.
- This will only show your client secret once. Fill the **value** to the Logto connector configuration and save it to a secure location.

## Config types

| Name          | Type   |
| ------------- | ------ |
| clientId      | string |
| clientSecret  | string |
| tenantId      | string |
| cloudInstance | string |

## References
* [Web app that signs in users](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-web-app-sign-user-overview)
