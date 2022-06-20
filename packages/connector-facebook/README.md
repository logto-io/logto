# Facebook

The Facebook connector provides a concise way for your application to use Facebook's OAuth 2.0 authentication system.

## Register a Facebook developer account

[Register as a Facebook Developer](https://developers.facebook.com/docs/development/register/) if you don't already have one

## Set up a Facebook app

1. Visit the [Apps](https://developers.facebook.com/apps) page.
2. Click your existing app or [create a new one](https://developers.facebook.com/docs/development/create-an-app) if needed.
3. On the app dashboard page, scroll to the **Add a product** section and click the **Set up** button on the **Facebook Login** card.
4. Skip the Facebook Login Quickstart page, and click the left sidebar -> **Products** -> **Facebook Login** -> **Settings**.
5. In the Facebook Login Settings page, fill out `${your_logto_origin}/callback/facebook-universal` in the **Valid OAuth Redirect URIs** field. E.g.:
    - `https://logto.dev/callback/facebook-universal` for production
    - `https://localhost:3001/callback/facebook-universal` for testing in the local environment
6. Click the "**Save changes**" button at the bottom right corner.

## Set up the Logto connector settings

1. In the Facebook app dashboard page, click the left sidebar -> **Settings** -> **Basic**.
2. You will see the **App ID** and **App secret** on the right column.
3. Click the **Show** button following the App secret input box to copy its content.
4. Fill out the Logto connector settings:
    - Fill out the `clientId` field with the string from **App ID**.
    - Fill out the `clientSecret` field with the string from **App secret**.

## Debug sign-in with the test users

You can use the accounts of the test users and the admin developers to test sign-in with the related app.

- In the app dashboard page, click the left sidebar -> **Roles** -> **Test Users**.
- Click the **Create test users** button to create a testing user while testing.
- Click the **Options** button of the existing test user, and you will see more manipulations, e.g., "Change name and password".

## Take the Facebook app live

Only the test, admin, and developer users can sign in with the related app under [development mode](https://developers.facebook.com/docs/development/build-and-test/app-modes#development-mode).

To enable normal Facebook users sign-in with the app in the production environment, you must switch your Facebook app to **[live mode](https://developers.facebook.com/docs/development/build-and-test/app-modes#live-mode)**.

1. In the Facebook app dashboard page, click the left sidebar -> **Settings** -> **Basic**.
2. Fill out the required **Privacy Policy URL** field on the right column to take the app live.
3. Click the **Save changes** button at the bottom right corner.
4. Click the **Live** switch button on the app top bar.

## References

- [Facebook Login - Documentation - Facebook for Developers](https://developers.facebook.com/docs/facebook-login/)
    - [Manually Build a Login Flow](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/)
    - [Permissions Guide](https://developers.facebook.com/docs/facebook-login/guides/permissions)
