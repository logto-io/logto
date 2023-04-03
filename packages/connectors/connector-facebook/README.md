# Facebook connector

The official Logto connector for Facebook social sign-in.

**Table of contents**

- [Facebook connector](#facebook-connector)
  - [Get started](#get-started)
    - [Register a Facebook developer account](#register-a-facebook-developer-account)
    - [Set up a Facebook app](#set-up-a-facebook-app)
  - [Compose the connector JSON](#compose-the-connector-json)
  - [Test sign-in with Facebook's test users](#test-sign-in-with-facebooks-test-users)
  - [Publish Facebook sign-in settings](#publish-facebook-sign-in-settings)
  - [Config types](#config-types)
  - [References](#references)
## Get started

The Facebook connector provides a concise way for your application to use Facebook's OAuth 2.0 authentication system.

### Register a Facebook developer account

[Register as a Facebook Developer](https://developers.facebook.com/docs/development/register/) if you don't already have one

### Set up a Facebook app

1. Visit the [Apps](https://developers.facebook.com/apps) page.
2. Click your existing app or [create a new one](https://developers.facebook.com/docs/development/create-an-app) if needed.
   - The selected [app type](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/app-types) is up to you, but it should have the product _Facebook Login_.
3. On the app dashboard page, scroll to the "Add a product" section and click the "Set up" button on the "Facebook Login" card.
4. Skip the Facebook Login Quickstart page, and click the sidebar -> "Products" -> "Facebook Login" -> "Settings".
5. In the Facebook Login Settings page, fill `${your_logto_origin}/callback/${connector_id}` in the "Valid OAuth Redirect URIs" field. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page. E.g.:
    - `https://logto.dev/callback/${connector_id}` for production
    - `https://localhost:3001/callback/${connector_id}` for testing in the local environment
6. Click the "Save changes" button at the bottom right corner.

## Compose the connector JSON

1. In the Facebook app dashboard page, click the sidebar -> "Settings" -> "Basic".
2. You will see the "App ID" and "App secret" on the panel.
3. Click the "Show" button following the App secret input box to copy its content.
4. Fill out the Logto connector settings:
    - Fill out the `clientId` field with the string from _App ID_.
    - Fill out the `clientSecret` field with the string from _App secret_.

## Test sign-in with Facebook's test users

You can use the accounts of the test, developer, and admin users to test sign-in with the related app under both development and live [app modes](https://developers.facebook.com/docs/development/build-and-test/app-modes).

You can also [take the app live](#take-the-facebook-app-live) directly so that any Facebook user can sign in with the app.

- In the app dashboard page, click the sidebar -> "Roles" -> "Test Users".
- Click the "Create test users" button to create a testing user.
- Click the "Options" button of the existing test user, and you will see more operations, e.g., "Change name and password".

## Publish Facebook sign-in settings

Usually, only the test, admin, and developer users can sign in with the related app under [development mode](https://developers.facebook.com/docs/development/build-and-test/app-modes#development-mode).

To enable normal Facebook users sign-in with the app in the production environment, you maybe need to switch your Facebook app to _[live mode](https://developers.facebook.com/docs/development/build-and-test/app-modes#live-mode)_, depending on the app type.
E.g., the pure _business type_ app doesn't have the "live" switch button, but it won't block your use.

1. In the Facebook app dashboard page, click the sidebar -> "Settings" -> "Basic".
2. Fill out the "Privacy Policy URL" and "User data deletion" fields on the panel if required.
3. Click the "Save changes" button at the bottom right corner.
4. Click the "Live" switch button on the app top bar.

## Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |

## References

- [Facebook Login - Documentation - Facebook for Developers](https://developers.facebook.com/docs/facebook-login/)
    - [Manually Build a Login Flow](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/)
    - [Permissions Guide](https://developers.facebook.com/docs/facebook-login/guides/permissions)
