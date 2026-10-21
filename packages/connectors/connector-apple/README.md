# Apple connector

The official Logto connector for Apple social sign-in.

**Table of contents**

- [Get started](#get-started)
  - [Enable Sign in with Apple for your app](#enable-sign-in-with-apple-for-your-app)
  - [Create an identifier](#create-an-identifier)
  - [Enable Sign in with Apple for your identifier](#enable-sign-in-with-apple-for-your-identifier)
- [Configure scope](#configure-scope)
  - [Pitfalls of configuring scope](#pitfalls-of-configuring-scope)
- [Test Apple connector](#test-apple-connector)
- [Troubleshooting](#troubleshooting)
  - [Apple caches your App ID and Services ID configuration](#apple-caches-your-app-id-and-services-id-configuration)
  - [`invalid_client`](#invalid_client)
  - [`invalid_request` with "Invalid web redirect url"](#invalid_request-with-invalid-web-redirect-url)

## Get started

If you don't know the concept of the connector or don't know how to add this connector to your Sign-in experience, please see [Logto tutorial](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in).

> ℹ️ **Note**
>
> Apple sign-in is required for AppStore if you have other social sign-in methods in your app.
> Having Apple sign-in on Android devices is great if you also provide an Android app.

You need to enroll [Apple Developer Program](https://developer.apple.com/programs/) before continuing.

### Enable Sign in with Apple for your app

> ⚠️ **Caution**
>
> Even if you want to implement Sign in with Apple on a web app only, you still need to have an existing app that embraces the AppStore ecosystem (i.e., have a valid App ID).

You do not need Xcode for this, or for any other step in this guide. Everything can be done from the Apple Developer portal.

**Option A: Apple Developer portal (no Xcode needed)**

1. Visit [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/bundleId) and make sure the filter dropdown on the top right is set to "App IDs".
2. Click the App ID you want to use, or click the "+" button next to "Identifiers" to register a new one.
3. On the "Capabilities" tab, check "Sign In with Apple". It is enabled as a primary App ID by default, which is what a Services ID groups under. Use the "Edit" button next to the capability to check or change this.
4. Click "Save" on the top right.

**Option B: Xcode**

Project settings -> Signing & Capabilities.

![Enable Sign in with Apple](/packages/connectors/connector-apple/docs/enable-sign-in-with-apple-in-xcode.png)

See the "Enable an App ID" section in [Apple official docs](https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple) for more info.

### Create an identifier

1. Visit [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/serviceId), then click the "+" button next to "Identifier".
2. In the "Register a new identifier" page, choose "Services IDs" and click "Continue".
3. Fill out "Description" and "Identifier" (E.g., `Logto Test` and `io.logto.test`), then click "Continue".
4. Double-check the info and click "Register".

### Enable Sign in with Apple for your identifier

Click the identifier you just created. Check "Sign in with Apple" on the details page and click "Configure".

![Enable Sign in with Apple](/packages/connectors/connector-apple/docs/enable-sign-in-with-apple.png)

In the opening modal, select the App ID you just enabled Sign in with Apple.

Enter the domain of your Logto instance without protocol and port, e.g., `your.logto.domain`; then enter the "Return URL" (i.e., Redirect URI), which is the Logto URL with `/callback/${connector_id}`, e.g., `https://your.logto.domain/callback/apple-universal`. You can get the randomly generated `connector_id` after creating Apple connector in Admin Console.

![domain-and-url](/packages/connectors/connector-apple/docs/domain-and-url.png)

Click "Next" then "Done" to close the modal. Click "Continue" on the top-right corner, then click "Save" to save your configuration.

> ⚠️ **Caution**
>
> Apple does NOT allow Return URLs with HTTP protocol and `localhost` domain.
>
> If you want to test locally, you need to edit `/etc/hosts` file to map localhost to a custom domain and set up a local HTTPS environment. [mkcert](https://github.com/FiloSottile/mkcert) can help you for setting up local HTTPS.

Finally, go back to the Apple connector in Logto Console and paste this identifier into the "Services ID" field, e.g., `io.logto.test`. This must be the Services ID you just configured, not your App ID (bundle ID).

## Configure scope

To get user's email from Apple, you need to configure the scope to include `email`. For both email and name, you can use `name email` as the scope. See [Apple official docs](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms#3332113) for more info.

> ℹ️ **Note**
>
> The user may choose to hide their email address from your app. In this case, you will not be able to retrieve the real email address. An email address like `random@privaterelay.appleid.com` will be returned instead.

### Pitfalls of configuring scope

If you have configured your app to request users' email addresses after they have already signed in with Apple, you will not be able to retrieve the email addresses for those existing users, even if they sign in again using Apple ID. To address this, you need to instruct your users to visit the [Apple ID account management page](https://appleid.apple.com/account/manage) and remove your application from the "Sign in with Apple" section. This can be done by selecting "Stop using Apple Sign In" on your app's detail page.

For instance, if your app requests both the users' email and name (`email name` scope), the consent page that new users see during their first sign-in should look similar to this:

![Sign in with Apple consent page](/packages/connectors/connector-apple/docs/sign-in-with-apple-consent-page.png)

See developer discussion [here](https://forums.developer.apple.com/forums/thread/132223).

## Test Apple connector

That's it. The Apple connector should be available in both web and native apps. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Troubleshooting

### Apple caches your App ID and Services ID configuration

> ⚠️ **Caution**
>
> Apple caches the Sign in with Apple configuration of your identifiers on their side. Changes to an App ID or a Services ID are not always picked up immediately, and have been observed to take up to 24 hours to take effect.

This is a common reason why a configuration that looks entirely correct still fails. If you have checked everything below and it still does not work, wait and try again before changing anything else. Repeatedly editing the configuration does not speed up the refresh.

If it is still failing well after 24 hours, [contact Apple Developer Support](https://developer.apple.com/contact/) and ask them to refresh the cached configuration of your identifier. They can clear the stale entry on their side.

### `invalid_client`

Apple shows this when it cannot resolve your `client_id` into a usable Sign in with Apple web client. An unregistered or mismatched Return URL surfaces as a different error (see below), so `invalid_client` points at the identifier rather than at the redirect URI.

Check the following, in order:

1. **Wait for Apple's cache to refresh.** See the section above.
2. **Check the "Services ID" field in Logto.** It must hold the Services ID identifier, not your App ID (bundle ID). The App ID is not a valid `client_id` for the web flow.
3. **Make sure the Services ID configuration was saved.** Reopen the Services ID in the Apple Developer portal and confirm your domain and Return URL are still listed. If they are gone, the "Done" -> "Continue" -> "Save" sequence was not completed and nothing was persisted.

### `invalid_request` with "Invalid web redirect url"

Your Return URL is not registered on the Services ID, or it does not match exactly.

Logto builds the redirect URI from the domain that serves your sign-in experience, so if you use a custom domain, register both your default Logto domain and your custom domain, as "Domains and Subdomains" and again as "Return URLs":

| Domains and Subdomains  | Return URLs                                             |
| ----------------------- | ------------------------------------------------------- |
| `your-tenant.logto.app` | `https://your-tenant.logto.app/callback/<connector-id>` |
| `auth.your-domain.com`  | `https://auth.your-domain.com/callback/<connector-id>`  |

Copy the redirect URIs from the connector page in Logto Console instead of typing them by hand. The connector ID is a randomly generated string, and a single wrong character produces the same error.
