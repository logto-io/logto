# Azure AD connector

The Azure AD connector provides a succinct way for your application to use Azure’s OAuth 2.0 authentication system.

**Table of contents**
- [Azure AD connector](#azureAD-connector)
  - [Set up Azure AD in the Azure Portal](#set-up-azure-ad-in-the-azure-portal)
  - [Configure your client secret](#configure-your-client-secret)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Config types](#config-types)
  - [References](#references)

## Set up Azure AD in the Azure Portal

- Visit the [Azure Portal](https://portal.azure.com/#home) and sign in with your Azure account. You need to have an active subscription to access Azure AD.
- Click the **Azure Active Directory** from the services they offer, and click the **App Registrations** from the left menu.
- Click **New Registration** at the top and enter a description, select your **access type** and add your **Redirect URI**, which redirect the user to the application after logging in. In our case, this will be `${your_logto_origin}/callback/azuread-universal`. e.g. `https://logto.dev/callback/azuread-universal`. You need to select Web as Platform.
- If you select **Single Tenant** for access type then you need to enter **TenantID**, else you need to enter `common` as Tenant ID.

## Configure your client secret
- In your newly created project, click the **Certificates & Secrets** to get a client secret, and click the **New client secret** from the top.
- Enter a description and an expiration.
- This will only show your client secret once. Save the **value** to a secure location.

## Compose the connector JSON
- Add your App Registration's **Client ID** into logto json.
- Add your **Client Secret** into logto json.
- Add your App Registration's **Tenant ID** into logto json.
- Add your Microsoft **Login Url** into logto json. This defaults to "https://login.microsoftonline.com/" for many applications, but you can set your custom domain if you have one. (Don't forget the trailing slash)


```json
{
  "clientId": "<client-id>",
  "clientSecret": "<client-secret>",
  "tenantId": "<tenant-id>",
  "cloudInstance": "https://login.microsoftonline.com/"
}
```


### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| cloudInstance | string |
| tenantId | string |

## References
* [Web app that signs in users](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-web-app-sign-user-overview?tabs=nodejs)
