# Amazon connector

The official Logto connector for Amazon social sign-in.

**Table of contents**

- [Amazon connector](#amazon-connector)
  - [Get started](#get-started)
  - [Setup a Amazon app](#setup-a-amazon-app)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test Amazon connector](#test-amazon-connector)
  - [Reference](#reference)

## Get started

The Amazon connector enables end-users to sign in to your application using their own Amazon accounts via the Amazon OAuth 2.0 authentication protocol.

## Setup a Amazon app

Go to the [Amazon Developer Portal](https://developer.amazon.com) and sign in with your account. If you don’t have an account, you can register for one.

Then, create an app.

**Step 1:** Go to "Login with Amazon" block in home page.

Or you can visit [this page](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html).

Follow the guide to create a new security profile.

After creating the security profile, you will get a Client ID and Client Secret from the table.

**Step 2:** Setup callback URLs.

Click "Manage" button on the right side of the table and go to "Web Settings" tab.

In the field "Allowed redirect URLs", add the following URL:

- `${your_logto_origin}/callback/${connector_id}`.

The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

## Configure your connector

In your Logto connector configuration, fill out the following fields with the values obtained from last step:

- **clientId:** Your App's Client ID.
- **clientSecret:** Your App's Client Secret.

`scope` is a space-delimited list of OIDC scopes. If not provided, the default scope is `openid profile`.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test Amazon connector

That's it! The Amazon connector should now be available for end-users to sign in with their Amazon accounts. Don't forget to [Enable the connector in the sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Amazon Developer Documentation](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html)
