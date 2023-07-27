# Apple connector

The official Logto connector for Apple social sign-in.

**Table of contents**

- [Apple connector](#apple-connector)
  - [Get started](#get-started)
    - [Enable Sign in with Apple for your app](#enable-sign-in-with-apple-for-your-app)
    - [Create an identifier](#create-an-identifier)
    - [Enable Sign in with Apple for your identifier](#enable-sign-in-with-apple-for-your-identifier)
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

![Enable Sign in with Apple](/packages/connector-apple/docs/enable-sign-in-with-apple-in-xcode.png)

See the "Enable an App ID" section in [Apple official docs](https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple) for more info.

### Create an identifier

1. Visit [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/serviceId), then click the "+" button next to "Identifier".
2. In the "Register a new identifier" page, choose "Services IDs" and click "Continue".
3. Fill out "Description" and "Identifier" (E.g., `Logto Test` and `io.logto.test`), then click "Continue".
4. Double-check the info and click "Register".

### Enable Sign in with Apple for your identifier

Click the identifier you just created. Check "Sign in with Apple" on the details page and click "Configure".

![Enable Sign in with Apple](/packages/connector-apple/docs/enable-sign-in-with-apple.png)

In the opening modal, select the App ID you just enabled Sign in with Apple.

Enter the domain of your Logto instance without protocol and port, e.g., `your.logto.domain`; then enter the "Return URL" (i.e., Redirect URI), which is the Logto URL with `/callback/${connector_id}`, e.g., `https://your.logto.domain/callback/apple-universal`. You can get the randomly generated `connector_id` after creating Apple connector in Admin Console.

![domain-and-url](/packages/connector-apple/docs/domain-and-url.png)

Click "Next" then "Done" to close the modal. Click "Continue" on the top-right corner, then click "Save" to save your configuration.

> ⚠️ **Caution**
> 
> Apple does NOT allow Return URLs with HTTP protocol and `localhost` domain.
> 
> If you want to test locally, you need to edit `/etc/hosts` file to map localhost to a custom domain and set up a local HTTPS environment. [mkcert](https://github.com/FiloSottile/mkcert) can help you for setting up local HTTPS.

> ℹ️ **Note**
> 
> This connector doesn't support customizing `scope` (e.g., name, email) yet since Apple requires `form_post` response mode when `scope` is not empty, which is incompatible with the current connector design.
> 
> We'll figure out this later.

## Test Apple connector

That's it. The Apple connector should be available in both web and native apps. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-social-sign-in).
