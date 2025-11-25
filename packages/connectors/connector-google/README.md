# Google connector

Integrate Google OAuth 2.0 authentication system to enable Sign-in with Google, account linking, and secure access to Google APIs.

**Table of contents**
- [Get started](#get-started)
- [Step 1: Create a project on Google Auth Platform](#step-1-create-a-project-on-google-auth-platform)
- [Step 2: Create OAuth 2.0 credentials](#step-2-create-oauth-20-credentials)
- [Step 3: Configure Logto connector with credentials](#step-3-configure-logto-connector-with-credentials)
- [Step 4: Configure scopes](#step-4-configure-scopes)
- [Step 5: Customize authentication prompts](#step-5-customize-authentication-prompts)
- [Step 6: General settings](#step-6-general-settings)
- [Step 7: Enable Google One Tap (Optional)](#step-7-enable-google-one-tap-optional)
- [Step 8: Test and publish your app](#step-8-test-and-publish-your-app)
- [Utilize the Google connector](#utilize-the-google-connector)
- [Manage user's Google identity](#manage-users-google-identity)
- [Reference](#reference)

## Get started

The Google connector enables OAuth 2.0 integration to let your application:

- Add "Sign-in with Google" authentication
- Link user accounts to Google identities
- Sync user profile info from Google
- Access Google APIs through secure token storage in Logto [Secret Vault](https://docs.logto.io/secret-vault/federated-token-set) for automation tasks (e.g., editing Google Docs, managing Calendar events in your app)

## Step 1: Create a project on Google Auth Platform

Before you can use Google as an authentication provider, you must set up a project in the Google Cloud Console to obtain OAuth 2.0 credentials. If you already have a project, you can skip this step.

1. Visit the [Google Cloud Console](https://console.cloud.google.com/) and sign in with your Google account.
2. Click the **Select a project** button on the top menu bar, then click the **New Project** button to create a project.
3. In your newly created project, navigate to **APIs & Services > OAuth consent screen** to configure your app:
   - **App information**: Enter the **Application name** and **Support email** to be displayed on the consent page
   - **Audience**: Select your preferred audience type:
     - **Internal** - Only for Google Workspace users within your organization
     - **External** - For any Google user (requires verification for production use)
   - **Contact information**: Provide email addresses so Google can notify you about any changes to your project
   - Check **I agree to Google's policies** to finish the basic setup
4. Optionally, go to the **Branding** section to edit product info and upload your **App logo**, which will appear on the OAuth consent screen to help users recognize your app.

**Tip**: If you choose **External** audience type, you'll need to add test users during development and publish your app for production use.

## Step 2: Create OAuth 2.0 credentials

Navigate to the [Credentials](https://console.cloud.google.com/apis/credentials) page in Google Cloud Console and create OAuth credentials for your application.

1. Click **Create Credentials > OAuth client ID**.
2. Select **Web application** as the application type.
3. Fill in the **Name** of your OAuth client. This helps you identify the credentials and is not shown to end users.
4. Configure the authorized URIs:
   - **Authorized JavaScript origins**: Add your Logto instance's origin (e.g., `https://your-logto-domain.com`)
   - **Authorized redirect URIs**: Add the Logto **Callback URI** (copy this from your Logto Google connector)
5. Click **Create** to generate the OAuth client.

## Step 3: Configure Logto connector with credentials

After creating the OAuth client, Google will display a modal with your credentials:

1. Copy the **Client ID** and paste it into the `clientId` field in Logto
2. Copy the **Client secret** and paste it into the `clientSecret` field in Logto
3. Click **Save and Done** in Logto to connect your identity system with Google

**Warning**: Keep your client secret secure and never expose it in client-side code. If compromised, generate a new one immediately.

## Step 4: Configure scopes

Scopes define the permissions your app requests from users and control which data your app can access from their Google accounts.

### Configure scopes in Google Cloud Console

1. Navigate to **APIs & Services > OAuth consent screen > Data Access**.
2. Click **Add or Remove Scopes** and select only the scopes your app requires:
   - **Authentication (Required)**:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `openid`
   - **API access (Optional)**: Add any additional scopes needed for your app (e.g., Drive, Calendar, YouTube). Browse the [Google API Library](https://console.cloud.google.com/apis/library) to find available services. If your app needs access to Google APIs beyond basic permissions, first enable the specific APIs your app will use (e.g., Google Drive API, Gmail API, Calendar API) in the Google API Library.
3. Click **Update** to confirm the selection.
4. Click **Save and Continue** to apply the changes.

### Configure scopes in Logto

Choose one or more of the following approaches based on your needs:

**Option 1: No extra API scopes needed**

- Leave the `Scopes` field in your Logto Google connector blank.
- The default scopes `openid profile email` will be requested to ensure Logto can get basic user info properly.

**Option 2: Request additional scopes at sign-in**

- Enter all desired scopes in the **Scopes** field, separated by spaces.
- Any scopes you list here override the defaults, so always include the authentication scopes: `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid`.
- Use full scope URLs. Example: `https://www.googleapis.com/auth/calendar.readonly`.

**Option 3: Request incremental scopes later**

- After the user signs in, you can [request additional scopes](https://docs.logto.io/secret-vault/federated-token-set#reauthentication-and-token-renewal) on demand by reinitiating a federated social authorization flow and updating users' stored token set.
- These additional scopes do not need to be filled in the `Scopes` field in your Logto Google connector, and can be achieved through Logto's Social Verification API.

By following these steps, your Logto Google connector requests exactly the permissions your app needs - no more, no less.

**Tip**: If your app requests these scopes to access the Google API and perform actions, make sure to enable **Store tokens for persistent API access** in Logto Google connector. See the next section for details.

## Step 5: Customize authentication prompts

Configure **Prompts** in Logto to control the user authentication experience. Prompts is an array of strings that specifies the type of user interaction required:

- `none` - The authorization server does not display any authentication or consent screens. Returns an error if the user is not already authenticated and has not pre-configured consent for the requested scopes. Use this to check for existing authentication and/or consent.
- `consent` - The authorization server prompts the user for consent before returning information to the client. Required to enable **offline access** for Google API access.
- `select_account` - The authorization server prompts the user to select a user account. This allows users with multiple Google accounts to choose which account to use for authentication.

## Step 6: General settings

Here are some general settings that won't block the connection to Google but may affect the end-user authentication experience.

### Sync profile information

In the Google connector, you can set the policy for syncing profile information, such as user names and avatars. Choose from:

- **Only sync at sign-up**: Profile info is fetched once when the user first signs in.
- **Always sync at sign-in**: Profile info is updated every time the user signs in.

### Store tokens to access Google APIs (Optional)

If you want to access [Google APIs](https://console.cloud.google.com/apis/library) and perform actions with user authorization (whether via social sign-in or account linking), Logto needs to get specific API scopes and store tokens.

1. Add the required scopes in your Google Cloud Console OAuth consent screen configuration and Logto Google connector.
2. Enable **Store tokens for persistent API access** in Logto Google connector. Logto will securely store Google access and refresh tokens in the Secret Vault.
3. To ensure refresh tokens are returned, configure your Logto Google connector as follows:
   - Set **Prompts** to include `consent`
   - Enable **Offline Access**

**Warning**: You do not need to add `offline_access` in the Logto `Scope` field — doing so may cause an error. Google uses `access_type=offline` automatically when offline access is enabled.

## Step 7: Enable Google One Tap (Optional)

[Google One Tap](https://developers.google.com/identity/gsi/web/guides/features) is a secure and streamlined way to let users sign in to your website with their Google account using a popup interface.

Once you have the Google connector set up, you'll see a card for Google One Tap in the connector details page. Enable Google One Tap by toggling the switch.

### Google One Tap configuration options

- **Auto-select credential if possible** - Automatically sign in the user with the Google account if [certain conditions are met](https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out)
- **Cancel the prompt if user clicks/taps outside** - Close the Google One Tap prompt if the user clicks or taps outside the prompt. If disabled, the user must click the close button to dismiss the prompt.
- **Enable Upgraded One Tap UX on ITP browsers** - Enable the upgraded Google One Tap user experience on Intelligent Tracking Prevention (ITP) browsers. Refer to [this documentation](https://developers.google.com/identity/gsi/web/guides/features#upgraded_ux_on_itp_browsers) for more information.

**Warning**: Make sure to add your domain to the **Authorized JavaScript origins** section in your OAuth client configuration. Otherwise, Google One Tap cannot be displayed.

### Important limitations with Google One Tap

If you enable **Store tokens for persistent API access** along with **Google One Tap**, you won't automatically receive an access token or the requested scopes.

Google One Tap sign-in (unlike the standard "Sign in with Google" button) does **not** issue an OAuth access token. It only returns an ID token (a signed JWT) that verifies the user's identity, but does not grant API access.

To access Google APIs with Google One Tap users, you can use [Logto's Social Verification API](https://openapi.logto.io/operation/operation-createverificationbysocial) to [reinitiate a federated social authorization flow](https://docs.logto.io/secret-vault/federated-token-set#reauthentication-and-token-renewal) after the user signs in with Google One Tap. This allows you to request additional scopes as needed and update the user's stored token set, without requiring the scopes to be pre-filled in the Logto Google connector. This approach enables incremental authorization, so users are only prompted for extra permissions when your app actually needs them.

Learn more about [Google One Tap limitations](https://developers.google.com/identity/gsi/web/guides/overview) in the official documentation.

## Step 8: Test and publish your app

### For Internal apps

If your **Audience** type in Google is set to **Internal**, your app will be available only to Google Workspace users within your organization. You can test using any account from your organization.

### For External apps

If your **Audience** type is **External**:

1. **During development**: Navigate to **OAuth consent screen > Test users** and add test user email addresses. Only these users can sign in with your app.
2. **For production**: Click **Publish App** in the OAuth consent screen section to make it available to anyone with a Google Account.

**Note**: Apps with sensitive or restricted scopes may require Google's verification before they can be published. This process can take several weeks.

## Utilize the Google connector

Once you've created a Google connector and connected it to Google, you can incorporate it into your end-user flows. Choose the options that match your needs:

### Enable "Sign-in with Google"

1. In Logto Console, go to [Sign-in experience > Sign-up and sign-in](https://cloud.logto.io/to/sign-in-experience/sign-up-and-sign-in).
2. Add the Google connector under **Social sign-in** section to let users authenticate with Google.
3. Optionally enable **Google One Tap** on the sign-in and sign-up pages for a streamlined authentication experience.

Learn more about [social sign-in experience](https://docs.logto.io//end-user-flows/sign-up-and-sign-in/social-sign-in).

### Link or unlink a Google account

Use the Account API to build a custom Account Center in your app that lets signed-in users link or unlink their Google account. [Follow the Account API tutorial](https://docs.logto.io//end-user-flows/account-settings/by-account-api#link-a-new-social-connection)

**Tip**: It's allowed to enable the Google connector only for account linking and API access, without enabling it for social sign-in.

### Access Google APIs and perform actions

Your application can retrieve stored Google access tokens from the [Secret Vault](https://docs.logto.io/secret-vault) to call Google APIs and automate backend tasks (for example, managing Google Drive files, creating Calendar events, or sending emails through Gmail). [Refer to the guide](https://docs.logto.io/secret-vault/federated-token-set) on retrieving stored tokens for API access.

## Manage user's Google identity

After a user links their Google account, admins can manage that connection in the Logto Console:

1. Navigate to [Logto console > User management](https://cloud.logto.io/to/users) and open the user's profile.
2. Under **Social connections**, locate the Google item and click **Manage**.
3. On this page, admins can manage the user's Google connection, see all profile information granted and synced from their Google account, and check the [access token status](https://docs.logto.io/secret-vault/federated-token-set#token-storage-status).

## Reference

[Google Identity: Setting up OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup)

[Google Identity Services (One Tap)](https://developers.google.com/identity/gsi/web/guides/overview)

[Google Cloud Console](https://console.cloud.google.com/)
