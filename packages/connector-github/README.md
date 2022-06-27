# Github

The GitHub connector enables users to have access to your application using their own GitHub accounts via GitHub OAuth 2.0 authentication protocol.

## Sign-in with GitHub account

Go to [GitHub website](https://github.com/) and sign in with your GitHub account. You may register a new account if you don't have one.

## Create and configure GitHub OAuth app

Follow the [Creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) guide, and register a new application.

Name your new OAuth application in **Application name** and fill up **Homepage URL** of the app.
You can leave **Application description** field blank and customize **Authorization callback URL** as `${your_logto_origin}/callback/github-universal`.
We suggest not to check the box before **Enable Device Flow**, or users who sign in with GitHub on mobile devices must confirm the initial sign-in action in the GitHub app. Many GitHub users do not install the GitHub mobile app on their phones, which could block the sign-in flow. Please ignore our suggestion if you are expecting end-users to confirm their sign-in flow.

You can also enable end-users to sign in with GitHub accounts by [creating a GitHub app](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app).

## Managing GitHub OAuth apps

Go to the [OAuth Apps page](https://github.com/settings/developers) and you can add, edit or delete existing OAuth apps.
You can also find `Client ID` and generate `Client secrets` in OAuth app detail pages.

As for managing GitHub Apps we mentioned in the last section, go to the [GitHub Apps page](https://github.com/settings/apps).

## Set up the Logto GitHub connector settings

Fill out the `clientId` and `clientSecret` field with **Client ID** and **Client Secret** you've got from OAuth app detail pages mentioned in the previous section.

## Settings

|     Name     |  Type  |
|:------------:|:------:|
|   clientId   | string |
| clientSecret | string |
