# Microsoft Azure AD connector

The Microsoft Azure AD connector provides a succinct way for your application to use Azure’s OAuth 2.0 authentication system.

**Table of contents**
- [Microsoft Azure AD connector](#microsoft-azure-ad-connector)
  - [Set up Microsoft Azure AD in the Azure Portal](#set-up-microsoft-azure-ad-in-the-azure-portal)
  - [Configure your client secret](#configure-your-client-secret)
    - [Config types](#config-types)
  - [References](#references)

## Set up Microsoft Azure AD in the Azure Portal

- Visit the [Azure Portal](https://portal.azure.com/#home) and sign in with your Azure account. You need to have an active subscription to access Microsoft Azure AD.
- Click the **Azure Active Directory** from the services they offer, and click the **App Registrations** from the left menu.
- Click **New Registration** at the top and enter a description, select your **access type** and add your **Redirect URI**, which redirect the user to the application after logging in. In our case, this will be `${your_logto_origin}/callback/${connector_id}`. e.g. `https://logto.dev/callback/${connector_id}`. You need to select Web as Platform. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.
  - If you select **Sign in users of a specific organization only** for access type then you need to enter **TenantID**.
  - If you select **Sign in users with work and school accounts or personal Microsoft accounts** for access type then you need to enter **common**.
  - If you select **Sign in users with work and school accounts** for access type then you need to enter **organizations**.
  - If you select **Sign in users with personal Microsoft accounts (MSA) only** for access type then you need to enter **consumers**.

## Configure your client secret
- In your newly created project, click the **Certificates & Secrets** to get a client secret, and click the **New client secret** from the top.
- Enter a description and an expiration.
- This will only show your client secret once. Save the **value** to a secure location.

### Config types

| Name          | Type   |
| ------------- | ------ |
| clientId      | string |
| clientSecret  | string |
| tenantId      | string |
| cloudInstance | string |

## References
* [Web app that signs in users](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-web-app-sign-user-overview?tabs=nodejs)
