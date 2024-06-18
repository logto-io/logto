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

You can do it via Xcode -> Project settings -> Signing & Capabilities, or visit [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/bundleId).

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
