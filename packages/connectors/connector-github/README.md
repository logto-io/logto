# Github connector

The official Logto connector for GitHub social sign-in.

**Table of contents**

- [Github connector](#github-connector)
  - [Get started](#get-started)
  - [Sign in with GitHub account](#sign-in-with-github-account)
  - [Create and configure OAuth app](#create-and-configure-oauth-app)
  - [Managing OAuth apps](#managing-oauth-apps)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test GitHub connector](#test-github-connector)
  - [Reference](#reference)

## Get started

The GitHub connector enables end-users to sign in to your application using their own GitHub accounts via GitHub OAuth 2.0 authentication protocol.

## Sign in with GitHub account

Go to the [GitHub website](https://github.com/) and sign in with your GitHub account. You may register a new account if you don't have one.

## Create and configure OAuth app

Follow the [creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) guide, and register a new application.

Name your new OAuth application in **Application name** and fill up **Homepage URL** of the app.
You can leave **Application description** field blank and customize **Authorization callback URL** as `${your_logto_origin}/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

> Note: If you encounter the error message "The redirect_uri MUST match the registered callback URL for this application." when logging in, try aligning the Authorization Callback URL of your GitHub OAuth App and your Logto App's redirect URL (of course, including the protocol) to resolve the issue.

We suggest not to check the box before **Enable Device Flow**, or users who sign in with GitHub on mobile devices must confirm the initial sign-in action in the GitHub app. Many GitHub users do not install the GitHub mobile app on their phones, which could block the sign-in flow. Please ignore our suggestion if you are expecting end-users to confirm their sign-in flow. See details of [device flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow).

## Managing OAuth apps

Go to the [OAuth Apps page](https://github.com/settings/developers) and you can add, edit or delete existing OAuth apps.
You can also find `Client ID` and generate `Client secrets` in OAuth app detail pages.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _Client Secret_ you've got from OAuth app detail pages mentioned in the previous section.

`scope` is a space-delimited list of [scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps). If not provided, scope defaults to be `read:user`.

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |


## Test GitHub connector

That's it. The GitHub connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [GitHub - Developers - Apps](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)
- [GitHub - Developers - Apps - Creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
