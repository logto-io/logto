# Github connector

Integrate GitHub OAuth app to enable Sign-in with GitHub, account linking, and secure access to GitHub APIs.

**Table of contents**

- [Github connector](#github-connector)
  - [Get started](#get-started)
  - [Step 1: Create an OAuth app on GitHub](#step-1-create-an-oauth-app-on-github)
  - [Step 2: Configure your Logto connector](#step-2-configure-your-logto-connector)
  - [Step 3: Configure scopes (Optional)](#step-3-configure-scopes-optional)
  - [Step 4: General settings](#step-4-general-settings)
  - [Step 5: Test your integration (Optional)](#step-5-test-your-integration-optional)
  - [Utilize the GitHub connector](#utilize-the-github-connector)
  - [Manage user's GitHub identity](#manage-users-github-identity)
  - [Reference](#reference)

## Get started

The GitHub connector enables OAuth 2.0 integration to let your application:

- Add "Sign-in with GitHub" authentication
- Link user accounts to GitHub identities
- Sync user profile info from GitHub
- Access GitHub APIs through secure token storage in Logto [Secret Vault](https://docs.logto.io/secret-vault/federated-token-set) for automation tasks (e.g., creating GitHub issues, managing repositories from your app)

## Step 1: Create an OAuth app on GitHub

Before you can use GitHub as an authentication provider, you must create an OAuth App on GitHub to obtain OAuth 2.0 credentials.

1. Go to [GitHub](https://github.com/) and sign in with your account, or create a new account if needed.
2. Navigate to [Settings > Developer settings > OAuth apps](https://github.com/settings/developers).
3. Click **New OAuth App** to register a new application:
   - **Application name**: Enter a descriptive name for your app.
   - **Homepage URL**: Enter your application's homepage URL.
   - **Authorization callback URL**: Copy the **Callback URI** from your Logto GitHub connector and paste it here. After users sign in with GitHub, they'll be redirected here with an authorization code that Logto uses to complete authentication.
   - **Application description**: (Optional) Add a brief description of your app.
4. Click **Register application** to create the OAuth App.

**Note**:

We suggest not checking the box for **Enable Device Flow**, as users who sign in with GitHub on mobile devices would need to confirm the initial sign-in action in the GitHub mobile app. Many GitHub users do not install the GitHub mobile app on their phones, which could block the sign-in flow. Only enable this if you expect end-users to confirm their sign-in flow through the GitHub mobile app. See details about [device flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow).

For more details on setting up GitHub OAuth Apps, see [Creating an OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

## Step 2: Configure your Logto connector

After creating the OAuth app in GitHub, you'll be redirected to a details page where you can copy the Client ID and generate a Client secret.

1. Copy the **Client ID** from your GitHub OAuth app and paste it into the `clientId` field in Logto.
2. Click **Generate a new client secret** in GitHub to create a new secret, then copy and paste it into the `clientSecret` field in Logto.
3. Click **Save and Done** in Logto to connect your identity system with GitHub.

**Warning**: Keep your Client secret secure and never expose it in client-side code. GitHub client secrets cannot be recovered if lost - you'll need to generate a new one.

## Step 3: Configure scopes (Optional)

Scopes define the permissions your app requests from users and control which data your app can access from their GitHub accounts.

Use the `Scopes` field in Logto to request extra permissions from GitHub. Choose one of the following approaches based on your needs:

### Option 1: No extra API scopes needed

- Leave the `Scopes` field in your Logto GitHub connector blank.
- The default scope `read:user` will be requested to ensure Logto can get basic user info (e.g., email, name, avatar) properly.

### Option 2: Request additional scopes at sign-in

- Browse all available [GitHub scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) and add only the scopes your app needs.
- Enter all desired scopes in the **Scopes** field, separated by spaces.
- Any scopes you list here override the defaults, so always include the authentication scope: `read:user`.
- Common additional scopes include:
  - `repo`: Full control of private repositories
  - `public_repo`: Access to public repositories
  - `user:email`: Access to user email addresses
  - `notifications`: Access to notifications
- Ensure all scopes are spelled correctly and valid. An incorrect or unsupported scope will result in an "Invalid scope" error from GitHub.

### Option 3: Request incremental scopes later

- After the user signs in, you can [request additional scopes](https://docs.logto.io/secret-vault/federated-token-set#reauthentication-and-token-renewal) on demand by reinitiating a federated social authorization flow and updating users' stored token set.
- These additional scopes do not need to be filled in the `Scopes` field in your Logto GitHub connector, and can be achieved through Logto's Social Verification API.

By following these steps, your Logto GitHub connector requests exactly the permissions your app needs - no more, no less.

**Tip**: If your app requests these scopes to access the GitHub API and perform actions, make sure to enable **Store tokens for persistent API access** in Logto GitHub connector. See the next section for details.

## Step 4: General settings

Here are some general settings that won't block the connection to GitHub but may affect the end-user authentication experience.

### Sync profile information

In the GitHub connector, you can set the policy for syncing profile information, such as user names and avatars. Choose from:

- **Only sync at sign-up**: Profile info is fetched once when the user first signs in.
- **Always sync at sign-in**: Profile info is updated every time the user signs in.

### Store tokens to access GitHub APIs (Optional)

If you want to access GitHub APIs and perform actions with user authorization (whether via social sign-in or account linking), Logto needs to get specific API scopes and store tokens.

1. Add the required scopes following the instructions above.
2. Enable **Store tokens for persistent API access** in the Logto GitHub connector. Logto will securely store GitHub access tokens in the [Secret Vault](https://docs.logto.io/secret-vault/federated-token-set).

**Note**:

When using a GitHub **OAuth App** as described in this tutorial, you cannot get a refresh token from GitHub because its access token does not expire unless the user manually revokes it. Therefore, you do not need to add `offline_access` in the `Scopes` field — doing so may cause an error.

If you want the access token to expire or use refresh tokens, consider integrating with a **GitHub App** instead. Learn about the [differences between GitHub Apps and OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps).

## Step 5: Test your integration (Optional)

Before going live, test your GitHub integration:

1. Use the connector in a Logto development tenant.
2. Verify that users can sign in with GitHub.
3. Check that the correct scopes are being requested.
4. Test API calls if you're storing tokens.

GitHub OAuth Apps work with any GitHub user account immediately - there's no need for test users or app approval like some other platforms.

## Utilize the GitHub connector

Once you've created a GitHub connector and connected it to GitHub, you can incorporate it into your end-user flows. Choose the options that match your needs:

### Enable "Sign-in with GitHub"

1. In Logto Console, go to [Sign-in experience > Sign-up and sign-in](https://cloud.logto.io/to/sign-in-experience/sign-up-and-sign-in).
2. Add the GitHub connector under **Social sign-in** section to let users authenticate with GitHub.

Learn more about [social sign-in experience](https://docs.logto.io//end-user-flows/sign-up-and-sign-in/social-sign-in).

### Link or unlink a GitHub account

Use the Account API to build a custom Account Center in your app that lets signed-in users link or unlink their GitHub account. [Follow the Account API tutorial](https://docs.logto.io//end-user-flows/account-settings/by-account-api#link-a-new-social-connection)

**Tip**: It's allowed to enable the GitHub connector only for account linking and API access, without enabling it for social sign-in.

### Access GitHub APIs and perform actions

Your application can retrieve stored GitHub access tokens from the Secret Vault to call GitHub APIs and automate backend tasks (for example, creating issues, managing repositories, or automating workflows). Refer to the guide on retrieving stored tokens for API access.

## Manage user's GitHub identity

After a user links their GitHub account, admins can manage that connection in the Logto Console:

1. Navigate to [Logto console > User management](https://cloud.logto.io/to/users) and open the user's profile.
2. Under **Social connections**, locate the GitHub item and click **Manage**.
3. On this page, admins can manage the user's GitHub connection, see all profile information granted and synced from their GitHub account, and check the [access token status](https://docs.logto.io/secret-vault/federated-token-set#token-storage-status).

**Note**: GitHub's access token response does not include the specific scope information, so Logto cannot directly display the list of permissions granted by the user. However, as long as the user has consented to the requested scopes during authorization, your application will have the corresponding permissions when accessing the GitHub API.

## Reference

[GitHub Developer Documentation - About Apps](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)

[GitHub Developer Documentation - Creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)

[GitHub OAuth App Scopes Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
