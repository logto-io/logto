# LinkedIn connector

The official Logto connector for LinkedIn social sign-in.

**Table of contents**
- [LinkedIn connector](#linkedin-connector)
  - [Get started](#get-started)
  - [Setup a LinkedIn app](#setup-a-linkedin-app)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test LinkedIn connector](#test-linkedin-connector)
  - [Reference](#reference)

## Get started

The LinkedIn connector enables end-users to sign in to your application using their own LinkedIn accounts via the LinkedIn OAuth 2.0 authentication protocol.

## Setup a LinkedIn app

Go to the [LinkedIn Developers](https://www.linkedin.com/developers) and sign in with your LinkedIn account. If you don’t have an account, you can register for one.

Then, create an app.

**Step 1:** Fill in the App Details.

Complete the form and create the app.

**Step 2:** Setup callback URLs.

Go to App details page and find "Auth" tab, "OAuth 2.0" section and find the field "Authorized redirect URLs for your app".

In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

**Step 3:** Add the product.

Go to "Products" tab and add the product "Sign In with LinkedIn using OpenID Connect".

## Configure your connector

In your Logto connector configuration, fill out the following fields with the values obtained from your App's "Auth" tab, "Application credentials" section:

- **clientId:** Your App's Client ID.
- **clientSecret:** Your App's Primary Client Secret.

`scope` is a space-delimited list of OIDC scopes. If not provided, the default scope is `openid profile email`.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test LinkedIn connector

That's it! The LinkedIn connector should now be available for end-users to sign in with their LinkedIn accounts. Don't forget to [Enable the connector in the sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Sign in with LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin)
