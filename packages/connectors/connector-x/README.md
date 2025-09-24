# X connector

The official Logto connector for X (formerly Twitter) social sign-in.

**Table of contents**
- [X connector](#x-connector)
  - [Get started](#get-started)
  - [Create an app in the X Developer Portal](#create-an-app-in-the-x-developer-portal)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test X connector](#test-x-connector)
  - [Reference](#reference)

## Get started

The X connector enables end-users to sign in to your application using their own X (formerly Twitter) accounts via the X OAuth 2.0 authentication protocol.

## Create an app in the X Developer Portal

Go to the [X Developer Portal](https://developer.x.com/en/portal/projects-and-apps) and sign in with your X account. If you don’t have an account, you can register for one.

Then, create an app.

**Step 1:** Navigate to the app creation section.

Once signed in, go to the "Projects & Apps" section and click on **"Create App"** (or **"New App"**, depending on the interface).

**Step 2:** Fill in the app details.

Complete the form with the following information:

- **App Name:** Provide a unique and descriptive name for your application.
- **Application Description:** (Optional) Add a brief description of what your app does.
- **Website URL:** Enter the URL of your application's homepage.
- **Callback URL / Redirect URI:** In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

**Step 3:** Select permissions and scopes.

Choose the permissions that your app requires. For social sign-in via X, make sure you enable the necessary scopes `tweet.read` and `users.read`.

**Step 4:** Save your app.

Click **"Create"** or **"Save"** to register your app.  

After creation, navigate to your app’s **"Keys and tokens"** section to retrieve your **OAuth 2.0 Client ID and Client Secret**.

## Configure your connector

In your Logto connector configuration, fill out the following fields with the values obtained from your App's "Keys and tokens" page's "OAuth 2.0 Client ID and Client Secret" section:

- **clientId:** Your App's Client ID.
- **clientSecret:** Your App's Client Secret.

`scope` accepts a space-delimited list of [scopes](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code#scopes). If you omit it, the default `tweet.read users.read` is used, and those two scopes are always required. Add any others your app needs, for example, include `users.email` to sync the user’s email: `tweet.read users.read users.email`.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test X connector

That's it! The X connector should now be available for end-users to sign in with their X accounts. Don't forget to [Enable the connector in the sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [X Developer documentation](https://developer.x.com/en/docs)
- [X OAuth 2.0 Authorization Code Flow with PKCE](https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code)
