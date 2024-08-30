# GitLab Connector

The official Logto connector for GitLab social sign-in, based on the Hugging Face connector by Silverhand Inc.

**Table of contents**

- [GitLab connector](#gitlab-connector)
  - [Get started](#get-started)
  - [Sign in with GitLab account](#sign-in-with-gitlab-account)
  - [Create and configure OAuth app](#create-and-configure-oauth-app)
  - [Managing OAuth apps](#managing-oauth-apps)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test GitLab connector](#test-gitlab-connector)
  - [Reference](#reference)

## Get started

The GitLab connector enables end-users to sign in to your application using their own GitLab accounts via the GitLab OAuth 2.0 authentication protocol.

## Sign in with GitLab account

Go to the [GitLab website](https://gitlab.com/) and sign in with your GitLab account. You may register a new account if you don't have one.

## Create and configure OAuth app

Follow the [creating a GitLab OAuth App](https://docs.gitlab.com/ee/integration/oauth_provider.html) guide, and register a new application.

Name your new OAuth application in **Name** and fill up **Redirect URI** of the app. Customize the **Redirect URIs** as `${your_logto_origin}/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

On scopes, select `openid`. You also may want to enable `profile`, and `email`. `profile` scope is required to get the user's profile information, and `email` scope is required to get the user's email address. Ensure you have allowed these scopes in your GitLab OAuth app if you want to use them.

> Notes: 
> * If you use custom domains, add both the custom domain and the default Logto domain to the Redirect URIs to ensure the OAuth flow works correctly with both domains. 
> * If you encounter the error message "The redirect_uri MUST match the registered callback URL for this application." when logging in, try aligning the Redirect URI of your GitLab OAuth App and your Logto App's redirect URL (including the protocol) to resolve the issue.

## Managing OAuth apps

Go to the [Applications page](https://gitlab.com/-/profile/applications) on GitLab, where you can add, edit, or delete existing OAuth apps. You can also find the `Application ID` and generate `Secret` in the OAuth app detail pages.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with the _Application ID_ and _Secret_ you've got from the OAuth app detail pages mentioned in the previous section.

`scope` is a space-delimited list of [scopes](https://docs.gitlab.com/ee/integration/oauth_provider.html#authorized-applications). If not provided, scope defaults to be `openid`. For GitLab connector, the scope you may want to use are `openid`, `profile` and `email`. `profile` scope is required to get the user's profile information, and `email` scope is required to get the user's email address. Ensure you have allowed these scopes in your GitLab OAuth app (configured in [Create an OAuth app in the Hugging Face](#create-and-configure-oauth-app) section).

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test GitLab connector

That's it. The GitLab connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [GitLab - API Documentation](https://docs.gitlab.com/ee/api/)
- [GitLab - OAuth Applications](https://docs.gitlab.com/ee/integration/oauth_provider.html)