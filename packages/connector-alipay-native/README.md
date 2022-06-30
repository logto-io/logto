# Alipay Native

Alipay Native connector works closely with Logto SDK on mobile platforms. It takes advantage of Alipay's OAuth 2.0 authentication workflow and enables Alipay users to sign in to other Apps using public Alipay user profiles without going through a troublesome register process.

## Register Alipay developer account

[Register an Alipay developer account](https://certifyweb.alipay.com/certify/reg/guide#/) if you don't have one.

## Create and configure Alipay app

1. Sign in to the [Alipay console](https://open.alipay.com/) with the account you have just registered.
2. Go to **Web & Mobile Apps** tab in **My Application** panel.
3. Click **Create an App** button to start configuring your application.
4. Name your application in **Application Name** following the naming conventions and upload your **Application Icon**, make sure you choose **mobile application** as **App type**. For building iOS App, a unique **bundle ID** is required. Also, **application signature** and **application package name** are required for Android apps.
5. After finishing creating the application, we come to the Overview page, where we should click **add ability** to add **Third-party application authorization**, **Get member information** and **App Alipay login** before enabling Alipay sign-in.
6. Go to [Alipay Customer Center](https://b.alipay.com/index2.htm), and sign in with the Alipay developer account. Click **Account Center** on the top bar and go to **APPID binding**, whose entrance can be found at the bottom of the sidebar. **Add binding** by type in the APPID of the mobile application you just created in step 4. After finishing this step, you are expected to find abilities you have just added in step 5 kicks in.
7. Come back to Alipay open platform console page, and you can find **Interface signing method** in **development information** section. Click **set up** button, and you can find yourself on a page setting signing method. **Public Key** is the preferred signing mode, and fill in contents from the public key file you have generated in the text input box.
8. Set up **Authorization Redirect URI** by clicking **set up** button on the bottom of the Alipay console page. `${your_logto_origin}/callback/alipay-native` is the default redirect URI used in Logto core.
9. After finishing all these steps, go back to the top right corner of Alipay console page, and click **Submit for review**. Once the review is approved, you are good to go with a smooth Alipay sign-in flow.

## Set up the Logto Alipay Native connector settings

1. In [the Alipay console workspace](https://open.alipay.com/dev/workspace) go to **My application** panel and click **Web & Mobile Apps** tab, you can find APPID of all applications.
2. In step 7 of the previous part, you have already generated a key pair including a private key and a public key.
3. Fill out the Logto connector settings:
    - Fill out the `appId` field with APPID you've got from step 1.
    - Fill out the `privateKey` field with contents from the private key file mentioned in step 2. Remember to use '\n' to replace all newlines.
    - Fill out the `signType` filed with 'RSA2' due to the `Public key` signing mode we chose in step 7 of **Create And Configure Alipay Apps**.

### Config types

|    Name    |     Type    |   Enum values   |
|:----------:|:-----------:|:---------------:|
|    appId   |    string   |       N/A       |
| privateKey |    string   |       N/A       |
|  signType  | enum string | 'RSA' \| 'RSA2' |

## Enable Alipay native sign-in in your app

### iOS

We assume you have integrated [Logto iOS SDK](https://docs.logto.io/docs/recipes/integrate-logto/ios) in your app. In this case, things are pretty simple, and you don't even need to read the Alipay SDK doc:

**1. Add `LogtoSocialPluginAlipay` to your Xcode project**

Add the framework:

![Add framework](/packages/connector-alipay-native/docs/add-framework.png)

**2. Add the plugin to your `LogtoClient` init options**

```swift
let logtoClient = LogtoClient(
  useConfig: config,
  socialPlugins: [LogtoSocialPluginAlipay(callbackScheme: "your-scheme")]
)
```

Where `callbackScheme` is one of the [custom URL Schemes](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) that can navigate to your app.

### Test Alipay native connector

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in#enable-connector-in-sign-in-experience).

Once Alipay native connector is enabled, you can build and run your app to see if it works.

## References

- [Alipay Docs - Access Preparation - How to create an app](https://opendocs.alipay.com/support/01rau6)
- [Alipay Docs - Web & Mobile Apps - Create an app](https://opendocs.alipay.com/open/200/105310)
