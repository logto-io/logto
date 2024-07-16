# Google connector

The Google connector provides a succinct way for your application to use Google’s OAuth 2.0 authentication system.

**Table of contents**
- [Set up a project in the Google API Console](#set-up-a-project-in-the-google-api-console)
- [Configure your consent screen](#configure-your-consent-screen)
  - [Configure and register your application](#configure-and-register-your-application)
  - [Edit app registration](#edit-app-registration)
    - [Config OAuth consent screen](#config-oauth-consent-screen)
    - [Config scopes](#config-scopes)
    - [Add test users (External user type only)](#add-test-users-external-user-type-only)
- [Obtain OAuth 2.0 credentials](#obtain-oauth-20-credentials)
- [Configure your connector](#configure-your-connector)
  - [Config types](#config-types)
- [References](#references)

## Set up a project in the Google API Console

- Visit the [Google API Console](https://console.developers.google.com) and sign in with your Google account.
- Click the **Select a project** button on the top menu bar, and click the **New Project** button to create a project.
- In your newly created project, click the **APIs & Services** to enter the **APIs & Services** menu.

## Configure your consent screen

### Configure and register your application

- On the left **APIs & Services** menu, click the **OAuth consent screen** button.
- Choose the **User Type** you want, and click the **Create** button. (Note: If you select **External** as your **User Type**, you will need to add test users later.)

Now you will be on the **Edit app registration** page.

### Edit app registration

#### Config OAuth consent screen

- Follow the instructions to fill out the **OAuth consent screen** form.
- Click **SAVE AND CONTINUE** to continue.

#### Config scopes

- Click **ADD OR REMOVE SCOPES** and select `../auth/userinfo.email`, `../auth/userinfo.profile` and `openid` in the popup drawer, and click **UPDATE** to finish. It is recommended that you consider adding all the scopes you may use, otherwise some scopes you added in the configuration may not work.
- Fill out the form as you need.
- Click **SAVE AND CONTINUE** to continue.

#### Add test users (External user type only)

- Click **ADD USERS** and add test users to allow these users to access your application while testing.
- Click **SAVE AND CONTINUE** to continue.

Now you should have the Google OAuth 2.0 consent screen configured.

## Obtain OAuth 2.0 credentials

- On the left **APIs & Services** menu, click the **Credentials** button.
- On the **Credentials** page, click the **+ CREATE CREDENTIALS** button on the top menu bar, and select **OAuth client ID**.
- On the **Create OAuth client ID** page, select **Web application** as the application type.
- Fill out the basic information for your application.
- Click **+ Add URI** to add an authorized domain to the **Authorized JavaScript origins** section. This is the domain that your logto authorization page will be served from. In our case, this will be `${your_logto_endpoint_origin}`. e.g.`https://foo.logto.app`.
- Click **+ Add URI** in the ****Authorized redirect URIs**** section to set up the ****Authorized redirect URIs****, which redirect the user to the application after logging in. In our case, this will be `${your_logto_endpoint}/callback/${connector_id}`. e.g. `https://foo.logto.app/callback/${connector_id}`. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.
- Click **Create** to finish and then you will get the **Client ID** and **Client Secret**.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _Client Secret_ you've got from OAuth app detail pages mentioned in the previous section.

`scope` is a space-delimited list of [scopes](https://developers.google.com/identity/protocols/oauth2/scopes). If not provided, scope defaults to be `openid profile email`.

`prompts` is an array of strings that specifies the type of user interaction that is required. The string can be one of the following values:

- `none`: The authorization server does not display any authentication or user consent screens; it will return an error if the user is not already authenticated and has not pre-configured consent for the requested scopes. You can use none to check for existing authentication and/or consent.
- `consent`: The authorization server prompts the user for consent before returning information to the client.
- `select_account`: The authorization server prompts the user to select a user account. This allows a user who has multiple accounts at the authorization server to select amongst the multiple accounts that they may have current sessions for.

### Config types

| Name         | Type     |
|--------------|----------|
| clientId     | string   |
| clientSecret | string   |
| scope        | string   |
| prompts      | string[] |

## References
* [Google Identity: Setting up OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup)
