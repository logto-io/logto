# Facebook connector

Integrate Facebook OAuth 2.0 authentication system to enable Sign-in with Facebook, account linking, and secure access to Facebook APIs.

**Table of contents**

- [Get started](#get-started)
- [Step 1: Set up an app on Facebook App Dashboard](#step-1-set-up-an-app-on-facebook-app-dashboard)
- [Step 2: Set up Logto connector with client credentials](#step-2-set-up-logto-connector-with-client-credentials)
- [Step 3: Configure scopes](#step-3-configure-scopes)
- [Step 4: General settings](#step-4-general-settings)
- [Step 5: Test sign-in with Facebook's test users (Optional)](#step-5-test-sign-in-with-facebooks-test-users-optional)
- [Step 6: Publish Facebook sign-in settings](#step-6-publish-facebook-sign-in-settings)
- [Utilize the Facebook connector](#utilize-the-facebook-connector)
- [Manage user's Facebook identity](#manage-users-facebook-identity)
- [Reference](#reference)

## Get started

The Facebook connector enables OAuth 2.0 integration to let your application:

- Add “Sign-in with Facebook” authentication
- Link user accounts to Facebook identities
- Sync user profile info from Facebook
- Access Facebook APIs through secure token storage in Logto [Secret Vault](https://docs.logto.io/secret-vault) for automation tasks (e.g., reply to thread; publish content and videos in your app)

## Step 1: Set up an app on Facebook App Dashboard

Before you can use Facebook as an authentication provider, you must set up an app on the Facebook developer platform to obtain OAuth 2.0 credentials.

1. [Register as a Facebook Developer](https://developers.facebook.com/docs/development/register/) if you don't already have an account.
2. Visit the [Apps](https://developers.facebook.com/apps) page.
3. Click your existing app or [create a new one](https://developers.facebook.com/docs/development/create-an-app) if needed.
   - A use case is the primary way your app will interact with Meta and determines which APIs, features, permissions, and products are available to your app. If you need social authentication only (to get email & public_profile), select "Authentication and request data from users with Facebook Login". If you want to access Facebook APIs, choose your preferred use cases - most of them also support integrating "Facebook Login for business" after app creation.
4. After app creation, on the app dashboard page, navigate to **Use cases > Facebook Login > Settings** or **Facebook Login for business > Settings**.
5. Fill in the **Valid OAuth Redirect URIs** with the Logto **Callback URI** (copy this from your Logto Facebook connector). After users sign in with Facebook, they'll be redirected here with an authorization code that Logto uses to finish authentication.
6. Navigate to **Use cases** and click **Customize** of your use case to add the scopes. We recommend adding `email` and `public_profile` which are required to implement Sign-in with Facebook in Logto.

## Step 2: Set up Logto connector with client credentials

1. In the Facebook App Dashboard, click the sidebar **App settings > Basic**.
2. You will see the **App ID** and **App secret** on the panel.
3. Click the **Show** button next to the App secret input box to reveal and copy its content.
4. Configure your Logto Facebook connector settings:
   - Fill the `clientId` field with the **App ID**.
   - Fill the `clientSecret` field with the **App secret**.
   - Click **Save and Done** in Logto to connect your identity system with Facebook.

## Step 3: Configure scopes

Scopes define the permissions your app requests from users and control which private data your project can access from their Facebook accounts.

### Configure scopes in Facebook App Dashboard

1. Navigate to **Facebook App Dashboard > Use cases** and click the **Customize** button.
2. Add only the scopes your app needs. Users will review and authorize these permissions on the Facebook consent screen:
   - **For authentication (Required)**: `email` and `public_profile`.
   - **For API access (Optional)**: Any additional scopes your app needs (e.g., `threads_content_publish`, `threads_read_replies` for accessing the Threads API). Browse the [Meta Developer Documentation](https://developers.facebook.com/docs/) for available services.

### Configure scopes in Logto

Choose one or more of the following approaches based on your needs:

**Option 1: No extra API scopes needed**

- Leave the `Scopes` field in your Logto Facebook connector blank.
- The default scope `email public_profile` will be requested to ensure Logto can get basic user info properly.

**Option 2: Request additional scopes at sign-in**

- Enter all desired scopes in the **Scopes** field, separated by spaces.
- Any scopes you list here override the defaults, so always include the authentication scopes: `email public_profile`.

**Option 3: Request incremental scopes later**

- After the user signs in, you can [request additional scopes](https://docs.logto.io/secret-vault/federated-token-set#reauthentication-and-token-renewal) on demand by reinitiating a federated social authorization flow and updating users' stored token set.
- These additional scopes do not need to be filled in the `Scopes` field in your Logto Facebook connector, and can be achieved through Logto's Social Verification API.

By following these steps, your Logto Facebook connector requests exactly the permissions your app needs - no more, no less.

**Tip**: If your app requests these scopes to access the Facebook API and perform actions, make sure to enable **Store tokens for persistent API access** in Logto Facebook connector. See the next section for details.

## Step 4: General settings

Here are some general settings that won't block the connection to Facebook but may affect the end-user authentication experience.

### Sync profile information

In the Facebook connector, you can set the policy for syncing profile information, such as user names and avatars. Choose from:

- **Only sync at sign-up**: Profile info is fetched once when the user first signs in.
- **Always sync at sign-in**: Profile info is updated every time the user signs in.

### Store tokens to access Facebook APIs (Optional)

If you want to access Facebook APIs and perform actions with user authorization (whether via social sign-in or account linking), Logto needs to get specific API scopes and store tokens.

1. Add the required scopes following the tutorial above.
2. Enable **Store tokens for persistent API access** in the Logto Facebook connector. Logto will securely [store Facebook access tokens](https://docs.logto.io/secret-vault/federated-token-set) in the Secret Vault.

**Note**: Facebook doesn't provide refresh tokens. However, when token storage is enabled, Logto automatically requests a long-lived access token (60 days) upon user authentication. During this period, users can manually revoke access tokens, but otherwise won't need re-authorization to access Facebook APIs. Note: Don't add `offline_access` to the `Scope` field as this may cause errors.

## Step 5: Test sign-in with Facebook's test users (Optional)

You can use test, developer, and admin user accounts to test sign-in with the app. You can also publish the app directly so that any Facebook user can sign in.

1. In the Facebook App Dashboard, click the sidebar **App roles > Test Users**.
2. Click the **Create test users** button to create a testing user.
3. Click the **Options** button of an existing test user to see more operations, such as "Change name and password".

## Step 6: Publish Facebook sign-in settings

Usually, only test, admin, and developer users can sign in with the app. To enable normal Facebook users to sign in with the app in the production environment, you may need to publish this app.

1. In the Facebook App Dashboard, click the sidebar **Publish**.
2. Fill out the **Privacy Policy URL** and **User data deletion** fields if required.
3. Click the **Save changes** button at the bottom right corner.
4. Click the **Live** switch button on the app top bar.

## Utilize the Facebook connector

Once you've created a Facebook connector and connected it to Facebook, you can incorporate it into your end-user flows. Choose the options that match your needs:

### Enable "Sign-in with Facebook"

1. In Logto Console, go to [Sign-in experience > Sign-up and sign-in](https://cloud.logto.io/to/sign-in-experience/sign-up-and-sign-in).
2. Add the Facebook connector under **Social sign-in** section to let users authenticate with Facebook.

Learn more about [social sign-in experience](https://docs.logto.io/end-user-flows/sign-up-and-sign-in/social-sign-in).

### Link or unlink a Facebook account

Use the Account API to build a custom Account Center in your app that lets signed-in users link or unlink their Facebook account. [Follow the Account API tutorial](https://docs.logto.io/end-user-flows/account-settings/by-account-api#link-a-new-social-connection)

**Tip**: It's allowed to enable the Facebook connector only for account linking and API access, without enabling it for social sign-in.

### Access Facebook API and perform actions

Your application can retrieve stored Facebook access tokens from the Secret Vault to call Facebook APIs and automate backend tasks (for example, publishing content or managing posts). [Refer to the guide](https://docs.logto.io/secret-vault/federated-token-set) on retrieving stored tokens for API access.

## Manage user's Facebook identity

After a user links their Facebook account, admins can manage that connection in the Logto Console:

1. Navigate to [Logto console > User management](https://cloud.logto.io/to/users) and open the user's profile.
2. Under **Social connections**, locate the Facebook item and click **Manage**.
3. On this page, admins can manage the user's Facebook connection, see all profile information granted and synced from their Facebook account, and check the [access token status](https://docs.logto.io/secret-vault/federated-token-set#token-storage-status).

**Note**: Facebook's access token response does not include the specific scope information, so Logto cannot directly display the list of permissions granted by the user. However, as long as the user has consented to the requested scopes during authorization, your application will have the corresponding permissions when accessing the Facebook API. It is recommended to accurately configure the required scopes in both the Facebook Developer Console and Logto to ensure your app has the necessary access.

## Reference

[Facebook for Developers - Documentation](https://developers.facebook.com/docs/)

[Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
