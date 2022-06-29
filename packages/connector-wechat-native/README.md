# WeChat native connector

The official Logto connector for WeChat social sign-in in native apps (iOS and Android).

微信原生应用社交登录官方 Logto 连接器（iOS 和 Android）[中文文档](#微信原生连接器)

## Get started

If you don't know the concept of the connector or haven't added this connector to your Sign-in experience yet, please see [Logto tutorial](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in).

In native apps, you cannot use the web as a sign-in method of WeChat. Navigation to WeChat is required, and it also requires using their SDK.

We know it sounds scary, but don't worry. We'll handle it easily in this tutorial.

## Create a mobile app in the WeChat Open Platform

> 💡 **Tip**
> 
> You can skip some sections if you already finished.

### Create an account

Open https://open.weixin.qq.com/, click the "Sign Up" button in the upper-right corner, then finish the sign-up process.

### Create a mobile app

Sign in with the account you just created. In the "Mobile Application" (移动应用) tab, click the big green button "Create a mobile app" (创建移动应用).

![App tabs](/packages/connector-wechat-native/docs/app-tabs.png)

Let's fill out the required info in the application form.

![Create a mobile app](/packages/connector-wechat-native/docs/create-mobile-app.png)

### Basic info

Most of them are pretty straightforward, and we have several tips here:

- If you just want to test WeChat sign-in and the app is not on the App Store, in the "App is available" section, choose "No" to skip the "App download link".
- The "App operation flow chart" looks tricky. From our experience, you need to prepare a simple flowchart and several app screenshots to improve the possibility of passing the review.

Click "Next step" to move on.

### Platform info

You can configure one or both of the iOS and Android platforms for integrating Logto with WeChat native sign-in.

#### iOS app

Check "iOS app" (iOS 应用), then check the target device type of your app accordingly.

![App platform](/packages/connector-wechat-native/docs/platform.png)

If you chose "No" for the App Store availability, you cloud skip filling out the "AppStore download address" here.

Fill out _Bundle ID_, _Test version Bundle ID_, and _Universal Links_ (actually, only one link is needed 😂).

> ℹ️ **Note**
> 
> _Bundle ID_ and _Test version Bundle ID_ can be the same value.

> 💡 **Tip**
> 
> WeChat requires Universal Link for native sign-in. If you haven't set up or don't know it, please refer to the [Apple official doc](https://developer.apple.com/ios/universal-links/).

#### Android app

Check "Android app" (Android 应用).

![Android app platform](/packages/connector-wechat-native/docs/platform-android-app.png)

Fill out _Application Signing Signature_(应用签名) and _Application Package Name_(应用包名).

> **Note**
> 
>You need to sign your app to get a signature before your users can sign in with WeChat. Refer to the [Sign your app](https://developer.android.com/studio/publish/app-signing) for more information. 

After you finish signing your app, you can execute the `signingReport` task to get the signing signature.

```bash
./gradlew your-android-project:signingReport
```

The `MD5` value of the corresponding build variant's report will be the _Application Signing Signature_(应用签名), but remember to remove all semicolons from the value and cast it to lowercase.

E.g. `1A:2B:3C:4D` -> `1a2b3c4d`

### Waiting for the review result

After you have finished filling out the platform info, Click "Submit Review" to continue and wait for the review result.

Usually, the review goes fast, which will end within 1-2 days.

We suspect the reviewer is allocated randomly on each submission, and the standard is floating. You may get rejected the first time, but don't give up! State your status quo and ask the reviewer how to modify it.

## Compose the connector JSON

After passing the review, go to the application details page and generate an AppSecret. Compose the connector JSON with the following format:

```json
{
  "appId": "wx123456789",
  "appSecret": "some-random-string",
  "universalLink": "https://your.universal.link/path/"
}
```

## Add the Logto social support to your app

### iOS

We assume you have integrated [Logto iOS SDK](https://docs.logto.io/docs/recipes/integrate-logto/ios) in your app. In this case, things are pretty simple, and you don't even need to read the WeChat SDK doc:

**1. Add `LogtoSocialPluginWechat` to your Xcode project**

Add the framework:

![Add framework](/packages/connector-wechat-native/docs/add-framework.png)

And add `-ObjC` to your Build Settings > Linking > Other Linker Flags:

![Linker flags](/packages/connector-wechat-native/docs/linker-flags.png)

**2. Add the plugin to your `LogtoClient` init options**

```swift
let logtoClient = LogtoClient(
  useConfig: config,
  socialPlugins: [LogtoSocialPluginWechat()]
)
```

**3. Handle `onOpenURL` properly**

> ℹ️ **Note**
> 
> The function `LogtoClient.handle(url:)` will handle all the native connectors you enabled. You only need to call it once.

```swift
// SwiftUI
YourRootView()
  .onOpenURL { url in
      LogtoClient.handle(url: url)
  }

// or AppDelegate
func application(_ app: UIApplication, open url: URL, options: /*...*/) -> Bool {
  LogtoClient.handle(url: url)
}
```

### Android

We assume you have integrated [Logto Android SDK](https://docs.logto.io/docs/recipes/integrate-logto/android) in your app. In this case, things are pretty simple, and you don't even need to read the WeChat SDK doc:

**1. Add `Wechat Open SDK` to your project**

Ensure the `mavenCentral()` repository is in your Gradle project repositories:

```kotlin
repositories {
  // ...
  mavenCentral()
}
```

Add the Wechat Open SDK to your dependencies:

```kotlin
dependencies {
  // ...
  api("com.tencent.mm.opensdk:wechat-sdk-android:6.8.0")  // kotlin-script
  // or
  api 'com.tencent.mm.opensdk:wechat-sdk-android:6.8.0'   // groovy-script
}
```

**2. Introduce `WXEntryActivity` to your project**

Create a `wxapi` package under your package root and add the `WXEntryActivity` in the `wxapi` package (Take `com.sample.app` as an example):

```kotlin
// WXEntryActivity.kt
package com.sample.app.wxapi

import io.logto.sdk.android.auth.social.wechat.WechatSocialResultActivity

class WXEntryActivity: WechatSocialResultActivity()
```

```java
// WXEntryActivity.java
package com.sample.app.wxapi

import io.logto.sdk.android.auth.social.wechat.WechatSocialResultActivity

public class WXEntryActivity extends WechatSocialResultActivity {}
```

The final position of the `WXEntryActivity` under the project should look like this (Take Kotlin as an example):

```bash
src/main/kotlin/com/sample/app/wxapi/WXEntryActivity.kt
```

**3. Modify the `AndroidManifest.xml`**

Add the following lines to your `AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.sample.app">
  <queries>
    <!-- line to be added -->
    <package android:name="com.tencent.mm" />
  </queries>

  <application>
    <!-- line to be added -->
    <activity android:name=".wxapi.WXEntryActivity" android:exported="true"/>
  </application>
</manifest>
```

### Enable WeChat native connector

After you have added the Logto social support to your app, don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in#enable-connector-in-sign-in-experience).

Once WeChat native connector is enabled, you can build and run your app to see if it works.

> ⚠️ **Caution**
> 
> WeChat doesn't have a plan for those devices without the WeChat app installed. Logto will hide this connector during sign-in if so (which is the recommended way from the [official development guide](https://developers.weixin.qq.com/doc/oplatform/en/Mobile_App/WeChat_Login/Development_Guide.html)).

# 微信原生连接器

TBD
