# Slack connector

The official Logto connector for Slack social sign-in.

**Table of contents**
- [Slack connector](#slack-connector)
  - [Get started](#get-started)
  - [Set up Slack App](#set-up-slack-app)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test Slack connector](#test-slack-connector)
  - [Reference](#reference)

## Get started

The Slack connector enables end-users to sign in to your application using their own Slack accounts via the Slack OAuth 2.0 authentication protocol.

## Set up Slack App

Go to the [Slack API: Applications](https://api.slack.com/apps) and sign in with your Slack account. If you don’t have an account, you can register for one.

Then, create an app.

**Step 1:** Find `Client ID` and `Client Secret`.

You can find the `Client ID` and `Client Secret` on the **"Basic Information"** section.

**Step 2:** Set up redirect URLs.

Go to the **"OAuth & Permissions"** section, you can find the **"Redirect URLs"** form.

In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

You can refer to the [Slack API documentation](https://api.slack.com/authentication/sign-in-with-slack) for more details.

## Configure your connector

In your Logto connector configuration, fill out the following fields with the values obtained from your App's "Keys and tokens" page's "OAuth 2.0 Client ID and Client Secret" section:

- **clientId:** Your App's Client ID.
- **clientSecret:** Your App's Client Secret.

`scope` is a space-delimited list of OpenID scopes. If not provided, the default scope is `openid profile`.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test Slack connector

That's it! The Slack connector should now be available for end-users to sign in with their Slack accounts. Don't forget to [Enable the connector in the sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Slack API: Sign in with Slack](https://api.slack.com/authentication/sign-in-with-slack)
