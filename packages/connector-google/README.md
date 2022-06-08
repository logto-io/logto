# Google

The Google connector provides a succinct way for your application to use Google’s OAuth 2.0 authentication system.

## Set up a project in the Google API Console

1. Visit the [Google API Console](https://console.developers.google.com) and sign in with your Google account.
2. Click the **Select a project** button on the top menu bar, and click the **New Project** button to create a project.
3. In your newly created project, click the **APIs & Services** to enter the **APIs & Services** menu.

## Configure your consent screen

1. On the left **APIs & Services** menu, click the **OAuth consent screen** button.
2. Choose the **User Type** you want, and click the **Create** button.

Now you will be on the **Edit app registration** page. You need to complete the following steps:
1. Config **OAuth consent screen**.
2. Config **Scopes**.
3. Add Test users.

### Config OAuth consent screen

1. Follow the instructions to fill out the **OAuth consent screen** form.
2. Click **SAVE AND CONTINUE** to continue.

### Config Scopes

1. Click **ADD OR REMOVE SCOPES** and select `../auth/userinfo.email`, `../auth/userinfo.profile` and `openid` in the popup drawer, and click **UPDATE** to finish.
2. Fill out the form as you need.
3. Click **SAVE AND CONTINUE** to continue.

### Add Test Users

1. Click **ADD USERS**** and add test users to allow these users to access your application while testing.
2. Click **SAVE AND CONTINUE** to continue.

Now you should have the Google OAuth 2.0 consent screen configured.

## Obtain OAuth 2.0 credentials

1. On the left **APIs & Services** menu, click the **Credentials** button.
2. On the **Credentials** page, click the **+ CREATE CREDENTIALS** button on the top menu bar, and select **OAuth client ID**.
3. On the **Create OAuth client ID** page, select **Web application** as the application type.
4. Fill out the basic information for your application.
5. Click **+ Add URI** to add an authorized domain to the **Authorized JavaScript origins** section. This is the domain that your logto authorization page will be served from. In our case, this will be `${your_logto_origin}`. e.g.`https://logto.dev`.
6. Click **+ Add URI** in the ****Authorized redirect URIs**** section to set up the ****Authorized redirect URIs****, which redirect the user to the application after logging in. In our case, this will be `${your_logto_origin}/callback/google-universal`. e.g. `https://logto.dev/callback/google-universal`.
7. Click **Create** to finish and then you will get the **Client ID** and **Client Secret**.

## Settings

| Name | Type |
| --- | --- |
| clientId | string |
| clientSecret | string |
