# Line connector

The official Logto connector for Line social sign-in.

**Table of contents**
- [Line connector](#line-connector)
  - [Get started](#get-started)
  - [Setup a Line channel](#setup-a-line-channel)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test Line connector](#test-line-connector)
  - [Reference](#reference)

## Get started

The Line connector enables end-users to sign in to your application using their own Line accounts via the Line OAuth 2.0 authentication protocol.

## Setup a Line channel

Go to the [Line Developers](https://developers.line.biz/console/) and sign in with your Line business account. If you don’t have an account, you can register for one.

Then, go to [this link](https://developers.line.biz/console/register/line-login/provider/) to create a channel.

**Step 1:** Fill in the Channel Details.

Complete the form and create the channel.

**Step 2:** Setup callback URLs.

Go to channel details page and find "LINE login" tab and edit the "Callback URL" field.

In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

## Configure your connector

In your Logto connector configuration, fill out the following fields with the values obtained from your App's "Auth" tab, "Application credentials" section:

- **clientId:** Your App's Channel ID.
- **clientSecret:** Your App's Channel Secret.

`scope` is a space-delimited list of OIDC scopes. If not provided, the default scope is `openid profile`.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test Line connector

That's it! The Line connector should now be available for end-users to sign in with their Line accounts. Don't forget to [Enable the connector in the sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Line Developer Documentation](https://developers.line.biz/en/docs/line-login/overview/)
