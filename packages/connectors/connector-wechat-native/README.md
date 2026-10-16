# WeChat native connector

The official Logto connector for WeChat social sign-in in native apps (iOS and Android).

微信原生应用社交登录 Logto 官方连接器（iOS 和 Android）[中文文档](#微信原生连接器)

**Table of contents**

- [WeChat native connector](#wechat-native-connector)
  - [Get started](#get-started)
  - [Create a mobile app in the WeChat Open Platform](#create-a-mobile-app-in-the-wechat-open-platform)
    - [Create an account](#create-an-account)
    - [Create a mobile app](#create-a-mobile-app)
      - [Basic info](#basic-info)
      - [Platform info](#platform-info)
      - [Waiting for the review result](#waiting-for-the-review-result)
  - [Enable WeChat native sign-in in your app](#enable-wechat-native-sign-in-in-your-app)
    - [iOS](#ios)
    - [Android](#android)
  - [Test WeChat native connector](#test-wechat-native-connector)
- [微信原生连接器](#微信原生连接器)
  - [开始上手](#开始上手)
  - [在微信开放平台中创建一个移动应用](#在微信开放平台中创建一个移动应用)
    - [创建一个帐户](#创建一个帐户)
    - [创建一个移动应用](#创建一个移动应用)
      - [基础信息](#基础信息)
      - [平台信息](#平台信息)
      - [等待审核结果](#等待审核结果)
  - [在你的应用中启用微信原生登录](#在你的应用中启用微信原生登录)
    - [iOS](#ios-1)
    - [Android](#android-1)
  - [测试微信原生连接器](#测试微信原生连接器)


## Get started

If you don't know the concept of the connector or don't know how to add this connector to your Sign-in experience, please see [Logto tutorial](https://docs.meshx.io/docs/tutorials/get-started/enable-social-sign-in).

In native apps, you cannot use the web as a sign-in method of WeChat: navigation to the WeChat app is required, and it also requires using their SDK.

We know it sounds scary, but don't worry. We'll handle it easily in this tutorial.

## Create a mobile app in the WeChat Open Platform

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an account

Open https://open.weixin.qq.com/, click the "Sign Up" button in the upper-right corner, then finish the sign-up process.

### Create a mobile app

Sign in with the account you just created. In the "Mobile Application" (移动应用) tab, click the big green button "Create a mobile app" (创建移动应用).

![App tabs](/packages/connectors/connector-wechat-native/docs/app-tabs.png)

Let's fill out the required info in the application form.

![Create a mobile app](/packages/connectors/connector-wechat-native/docs/create-mobile-app.png)

#### Basic info

Most of them are pretty straightforward, and we have several tips here:

- If you just want to test WeChat sign-in and the app is not on the App Store, in the "App is available" section, choose "No" to skip the "App download link".
- The "App operation flow chart" looks tricky. From our experience, you need to prepare a simple flowchart and several app screenshots to improve the possibility of passing the review.

Click "Next step" to move on.

#### Platform info

You can configure one or both iOS and Android platforms to integrate Logto with WeChat native sign-in.

**iOS app**

Check "iOS app" (iOS 应用), then check the target device type of your app accordingly.

![App platform](/packages/connectors/connector-wechat-native/docs/platform.png)

If you chose "No" for the App Store availability, you cloud skip filling out the "AppStore download address" here.

Fill out _Bundle ID_, _Test version Bundle ID_, and _Universal Links_ (actually, only one link is needed 😂).

> ℹ️ **Note**
> 
> _Bundle ID_ and _Test version Bundle ID_ can be the same value.

> 💡 **Tip**
> 
> WeChat requires universal link for native sign-in. If you haven't set up or don't know it, please refer to the [Apple official doc](https://developer.apple.com/ios/universal-links/).

**Android app**

Check "Android app" (Android 应用).

![Android app platform](/packages/connectors/connector-wechat-native/docs/platform-android-app.png)

Fill out _Application Signing Signature_ (应用签名) and _Application Package Name_ (应用包名).

> ℹ️ **Note**
> 
> You need to sign your app to get a signature. Refer to the [Sign your app](https://developer.android.com/studio/publish/app-signing) for more info.

After finish signing, you can execute the `signingReport` task to get the signing signature.

```bash
./gradlew your-android-project:signingReport
```

The `MD5` value of the corresponding build variant's report will be the _Application Signing Signature_ (应用签名), but remember to remove all semicolons from the value and lowercase it.

E.g. `1A:2B:3C:4D` -> `1a2b3c4d`.

#### Waiting for the review result

After completing the platform info, click "Submit Review" to continue. Usually, the review goes fast, which will end within 1-2 days.

We suspect the reviewer is allocated randomly on each submission since the standard is floating. You may get rejected the first time, but don't give up! State your status quo and ask the reviewer how to modify it.

## Enable WeChat native sign-in in your app

### iOS

We assume you have integrated [Logto iOS SDK](https://docs.meshx.io/docs/recipes/integrate-logto/ios) in your app. In this case, things are pretty simple, and you don't even need to read the WeChat SDK doc:

**1. Configure universal link and URL scheme in your Xcode project**

In the Xcode project -> Signing & Capabilities tab, add the "Associated Domains" capability and the universal link you configured before.

![Universal link](/packages/connectors/connector-wechat-native/docs/universal-link.png)

Then goes to the "Info" tab, add a [custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) with the WeChat App ID.

![Custom URL scheme](/packages/connectors/connector-wechat-native/docs/custom-url-scheme.png)

Finally open your `Info.plist`, add `weixinULAPI` and `weixin` under `LSApplicationQueriesSchemes`.

![Plist](/packages/connectors/connector-wechat-native/docs/plist.png)

> 🤦 **Note**
> 
> We know these actions are not very reasonable, but this is the minimum workable solution we found. See the [magical official guide](https://developers.weixin.qq.com/doc/oplatform/en/Mobile_App/Access_Guide/iOS.html) for more info.

**2. Add `LogtoSocialPluginWechat` to your Xcode project**

Add the framework:

![Add framework](/packages/connectors/connector-wechat-native/docs/add-framework.png)

And add `-ObjC` to your Build Settings > Linking > Other Linker Flags:

![Linker flags](/packages/connectors/connector-wechat-native/docs/linker-flags.png)

> ℹ️ **Note**
> 
> The plugin includes WeChat Open SDK 1.9.2. You can directly use `import WechatOpenSDK` once imported the plugin.

**3. Add the plugin to your `LogtoClient` init options**

```swift
let logtoClient = LogtoClient(
  useConfig: config,
  socialPlugins: [LogtoSocialPluginWechat()]
)
```

**4. Handle `onOpenURL` properly**

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

We assume you have integrated [Logto Android SDK](https://docs.meshx.io/docs/recipes/integrate-logto/android) in your app. In this case, things are pretty simple, and you don't even need to read the WeChat SDK doc:

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

Add the following line to your `AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.sample.app">

  <application>
    <!-- line to be added -->
    <activity android:name=".wxapi.WXEntryActivity" android:exported="true"/>
  </application>

</manifest>
```

## Test WeChat native connector

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.meshx.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

Once WeChat native connector is enabled, you can build and run your app to see if it works.

> ⚠️ **Caution**
> 
> WeChat doesn't have a plan for those devices without the WeChat app installed. Logto will hide this connector during sign-in if so (which is the recommended way from the [official development guide](https://developers.weixin.qq.com/doc/oplatform/en/Mobile_App/WeChat_Login/Development_Guide.html)).

# 微信原生连接器

## 开始上手

如果你还不知道连接器的概念，或者还不知道如何将本连接器添加至你的「登录体验」，请先参见 [Logto 教程](https://docs.meshx.io/zh-cn/docs/tutorials/get-started/enable-social-sign-in)。

在原生应用中，你无法通过 web 进行微信登录：必须跳转至微信 app，并使用他们提供的 SDK 才能完成。

听起来比较吓人？没关系。我们将在这个教程中轻松解决。
## 在微信开放平台中创建一个移动应用

> 💡 **Tip**
> 
> 你可以跳过已经完成的部分。

### 创建一个帐户

打开 https://open.weixin.qq.com/，点按右上角的「注册」按钮，并完成注册流程。

### 创建一个移动应用

用刚创建的帐号登录。在「移动应用」标签页，点按大而绿的「创建移动应用」按钮。

![App tabs](/packages/connectors/connector-wechat-native/docs/app-tabs.png)

让我们填写一下申请表单里的必要信息。

![Create a mobile app](/packages/connectors/connector-wechat-native/docs/create-mobile-app.png)

#### 基础信息

大多数字段都很直接，我们也有一些小提示：

- 如果你只是想测试微信登录，且你的应用还没上架，你可以在「应用已上架」区域中选择「否」以跳过填写「已上架应用下载链接」。
- 「App 运行流程图」这一项看起来很诡异。从我们的经验来说，你需要准备一个简单的流程图和一些应用截图来提升通过审核的概率。

点按「下一步」以继续。

#### 平台信息

你可以单独或同时配置 iOS 和 Android 平台，以在 Logto 中集成微信登录。

**iOS 应用**

勾选「iOS 应用」与你的应用的目标平台。

![App platform](/packages/connectors/connector-wechat-native/docs/platform.png)

如果你在「应用已上架」中选择了「否」，你可以在这一步跳过「AppStore 下载地址」的填写。

填写 _Bundle ID_、_测试版本 Bundle ID_ 和 _Universal Links_（实际上不需要填写多个 link，只填一个即可）。

> ℹ️ **Note**
> 
> _Bundle ID_ 和 _测试版本 Bundle ID_ 的值可以相同。

> 💡 **Tip**
> 
> 微信要求在原生应用中使用 universal link 来登录。如果你还没有设置好或者不知道这是什么，请参见 [苹果官方文档](https://developer.apple.com/ios/universal-links/)。

**Android 应用**

勾选「安卓应用」。

![Android app platform](/packages/connectors/connector-wechat-native/docs/platform-android-app.png)

填写「应用签名」和「应用包名」。

> ℹ️ **Note**
> 
> 你需要对你的应用签名并填写 signature。参见 [Sign your app](https://developer.android.com/studio/publish/app-signing) 以了解更多。

在完成签名后，你可以执行 `signingReport` 任务来获取 signature。

```bash
./gradlew your-android-project:signingReport
```

「应用签名」源于相关构建变体报告中 `MD5` 的值。记得移除所有冒号并转换成小写。

例如 `1A:2B:3C:4D` -> `1a2b3c4d`。

#### 等待审核结果

在填写完平台信息后，点按「提交审核」以继续。审核速度通常很快，1-2 天即可完成。

我们怀疑每次提交审核者都是随机分配的，因为审核标准飘忽不定。第一次提交也许会被拒绝，但别灰心！陈述你的现状并询问审核者如何修改。

## 在你的应用中启用微信原生登录

### iOS

我们假设你已经在你的应用中集成了 [Logto iOS SDK](https://docs.meshx.io/docs/recipes/integrate-logto/ios)。之后的流程很简单，你甚至不需要阅读微信 SDK 文档：

**1. 在你的 Xcode 工程中配置 universal link 与 URL scheme**

在 Xcode 工程 -> Signing & Capabilities 标签页中添加 "Associated Domains" capability 与你之前配置的 universal link。

![Universal link](/packages/connectors/connector-wechat-native/docs/universal-link.png)

接着切换到 "Info" 标签页，用微信 App ID 添加一个 [custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app)。

![Custom URL scheme](/packages/connectors/connector-wechat-native/docs/custom-url-scheme.png)

最终打开 `Info.plist`，在 `LSApplicationQueriesSchemes` 中添加 `weixinULAPI` 和 `weixin`。

![Plist](/packages/connectors/connector-wechat-native/docs/plist.png)

> 🤦 **Note**
> 
> 我们知道这些操作不是特别合理，但是这是我们找到的最小可工作方案。欲知详情请见 [奇妙的微信官方文档](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/iOS.html)。

**2. 添加 `LogtoSocialPluginWechat` 到你的 Xcode 工程**

添加 framework：

![Add framework](/packages/connectors/connector-wechat-native/docs/add-framework.png)

并添加 `-ObjC` 至 Build Settings > Linking > Other Linker Flags：

![Linker flags](/packages/connectors/connector-wechat-native/docs/linker-flags.png)

> ℹ️ **Note**
> 
> 该插件已包含 WeChat Open SDK 1.9.2。在引入插件后你可以直接使用 `import WechatOpenSDK`。

**3. 将插件添加至 `LogtoClient` 的初始化项**

```swift
let logtoClient = LogtoClient(
  useConfig: config,
  socialPlugins: [LogtoSocialPluginWechat()]
)
```

**4. 妥当处理 `onOpenURL`**

> ℹ️ **Note**
> 
> `LogtoClient.handle(url:)` 这个函数将处理你启用的所有原生连接器。你只需要调用该函数一次即可。

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

我们假设你已经在你的应用中集成了 [Logto Android SDK](https://docs.meshx.io/docs/recipes/integrate-logto/android)。之后的流程很简单，你甚至不需要阅读微信 SDK 文档：

**1. 添加 `Wechat Open SDK` 到你的项目中**

确保 `mavenCentral()` 已经被添加至你 Gradle 项目中的 repositories 中:

```kotlin
repositories {
  // ...
  mavenCentral()
}
```

添加 Wechat Open SDK 依赖:

```kotlin
dependencies {
  // ...
  api("com.tencent.mm.opensdk:wechat-sdk-android:6.8.0")  // kotlin-script
  // 或
  api 'com.tencent.mm.opensdk:wechat-sdk-android:6.8.0'   // groovy-script
}
```

**2. 将 `WXEntryActivity` 引入到项目中**

在项目的根 package 下创建一个 `wxapi` package，并在`wxapi` package 中创建 `WXEntryActivity`。
以 `com.sample.app` 为例）：

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

最终 `WXEntryActivity` 在项目中位置应该是这样的（以 Kotlin 为例）：

```bash
src/main/kotlin/com/sample/app/wxapi/WXEntryActivity.kt
```

**3. 编辑 `AndroidManifest.xml`**

将以下代码添加到项目的 `AndroidManifest.xml` 中:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.sample.app">

  <application>
    <!-- 添加的代码 -->
    <activity android:name=".wxapi.WXEntryActivity" android:exported="true"/>
  </application>

</manifest>
```

## 测试微信原生连接器

大功告成。别忘了 [在登录体验中启用本连接器](https://docs.meshx.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/)。

在微信原生连接器启用后，你可以构建并运行你的应用看看是否生效。

> ⚠️ **Caution**
> 
> 微信并不负责没装微信的设备。Logto 将在这些设备上隐藏本连接器（也是微信官方的 [推荐做法](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Development_Guide.html)）。
