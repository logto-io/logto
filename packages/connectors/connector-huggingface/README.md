# Hugging Face connector

The official Logto connector for Hugging Face social sign-in.

**Table of contents**

- [Hugging Face connector](#hugging-face-connector)
  - [Get started](#get-started)
  - [Sign in with Hugging Face account](#sign-in-with-hugging-face-account)
  - [Create an OAuth app in the Hugging Face](#create-an-oauth-app-in-the-hugging-face)
  - [Managing Hugging Face OAuth apps](#managing-hugging-face-oauth-apps)
  - [Configure your connector](#configure-your-connector)
    - [Config types](#config-types)
  - [Test Hugging Face connector](#test-hugging-face-connector)
  - [Reference](#reference)


## Get started

The Hugging Face connector enables end-users to sign in to your application using their own Hugging Face accounts via Hugging Face OAuth / OpenID connect flow.

## Sign in with Hugging Face account

Go to the [Hugging Face website](https://huggingface.co/) and sign in with your Hugging Face account. You may register a new account if you don't have one.

## Create an OAuth app in the Hugging Face

Follow the [Creating an oauth app](https://huggingface.co/docs/hub/en/oauth#creating-an-oauth-app) guide, and register a new application.

In the creation process, you will need to provide the following information:

- **Application Name**: The name of your application.
- **Homepage URL**: The URL of your application's homepage or landing page.
- **Logo URL**: The URL of your application's logo.
- **Scopes**: The scopes allowed for the OAuth app. For Hugging Face connector, usually use `profile` to get the user's profile information and `email` to get the user's email address. Ensure these scopes are allowed in your Hugging Face OAuth app if you want to use them.
- **Redirect URI**: The URL to redirect the user to after they have authenticated. You can find the redirect URI in the Logto Admin Console when you're creating a Hugging Face connector or in the created Hugging Face connector details page.

## Managing Hugging Face OAuth apps

Go to the [Connected Applications](https://huggingface.co/settings/connected-applications) page, you can add, edit or delete existing OAuth apps.
You can also find `Client ID` and generate `App secrets` in corresponding OAuth app settings pages.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _App Secret_ you've got from OAuth app detail pages mentioned in the previous section.

`scope` is a space-delimited list of [Hugging Face supported scopes](https://huggingface.co/docs/hub/en/oauth#currently-supported-scopes). If not provided, scope defaults to be `profile`. For Hugging Face connector, the scope you may want to use is `profile` and `email`. `profile` scope is required to get the user's profile information, and `email` scope is required to get the user's email address. Ensure you have allowed these scopes in your Hugging Face OAuth app (configured in [Create an OAuth app in the Hugging Face](#create-an-oauth-app-in-the-hugging-face) section).

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |


## Test Hugging Face connector

That's it. The Hugging Face connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [Hugging Face - Sign in with Hugging Face](https://huggingface.co/docs/hub/en/oauth#sign-in-with-hugging-face)
