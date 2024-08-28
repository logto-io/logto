# Patreon Connector

The official Logto connector for Patreon social sign-in, based on the Hugging Face connector by Silverhand Inc.

**Table of contents**

- [Patreon connector](#patreon-connector)
  - [Get started](#get-started)
  - [Sign in with Patreon account](#sign-in-with-patreon-account)
  - [Create and configure OAuth app](#create-and-configure-oauth-app)
  - [Managing OAuth apps](#managing-oauth-apps)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test Patreon connector](#test-patreon-connector)
  - [Reference](#reference)

## Get started

The Patreon connector enables end-users to sign in to your application using their own Patreon accounts via the Patreon OAuth 2.0 authentication protocol. This connector is adapted from the Hugging Face connector by Silverhand Inc., leveraging many of the same implementation patterns and configurations.

## Sign in with Patreon account

Go to the [Patreon website](https://www.patreon.com/) and sign in with your Patreon account. You may register a new account if you don't have one.

## Create and configure OAuth app

Follow the [creating a Patreon OAuth App](https://www.patreon.com/portal/registration/register-clients) guide, and register a new application.

Name your new OAuth application in **App Name** and fill up **App URL** of the app. You can leave the **App Description** field blank and customize the **Redirect URIs** as `${your_logto_origin}/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

> Note: If you encounter the error message "The redirect_uri MUST match the registered callback URL for this application." when logging in, try aligning the Redirect URI of your Patreon OAuth App and your Logto App's redirect URL (including the protocol) to resolve the issue.

## Managing OAuth apps

Go to the [Clients & API Keys page](https://www.patreon.com/portal/registration/register-clients) on Patreon, where you can add, edit, or delete existing OAuth apps. You can also find the `Client ID` and generate `Client secrets` in the OAuth app detail pages.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with the _Client ID_ and _Client Secret_ you've got from the OAuth app detail pages mentioned in the previous section.

`scope` is a space-delimited list of [scopes](https://docs.patreon.com/#scopes). If not provided, the scope defaults to `identity identity[email]`.

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test Patreon connector

That's it. The Patreon connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Patreon - API Documentation](https://docs.patreon.com/)
- [Patreon - Developers - Clients](https://www.patreon.com/portal/registration/register-clients)

---