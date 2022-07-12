# Apple connector

The official Logto connector for Apple social sign-in.

Apple 社交登录 Logto 官方连接器 [中文文档](#apple-连接器)

**Table of contents**

- [Apple connector](#apple-connector)
  - [Get started](#get-started)
    - [Enable Sign in with Apple for your app](#enable-sign-in-with-apple-for-your-app)
    - [Create an identifier](#create-an-identifier)
    - [Enable Sign in with Apple for your identifier](#enable-sign-in-with-apple-for-your-identifier)
  - [Compose the connector JSON](#compose-the-connector-json)
  - [Test Apple connector](#test-apple-connector)
- [Apple 连接器](#apple-连接器)
  - [开始上手](#开始上手)
    - [为你的应用启用「通过 Apple 登录」](#为你的应用启用通过-apple-登录)
    - [创建一个 identifier](#创建一个-identifier)
    - [为你的 identifier 启用「通过 Apple 登录」](#为你的-identifier-启用通过-apple-登录)
  - [编写连接器的 JSON](#编写连接器的-json)
  - [测试 Apple 连接器](#测试-apple-连接器)

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

Enter the domain of your Logto instance without protocol and port, e.g., `your.logto.domain`; then enter the "Return URL" (i.e., Redirect URI), which is the Logto URL with `/callback/apple-universal`, e.g., `https://your.logto.domain/callback/apple-universal`.

![domain-and-url](/packages/connector-apple/docs/domain-and-url.png)

Click "Next" then "Done" to close the modal. Click "Continue" on the top-right corner, then click "Save" to save your configuration.

> ⚠️ **Caution**
> 
> Apple does NOT allow Return URLs with HTTP protocol and `localhost` domain.
> 
> If you want to test locally, you need to edit `/etc/hosts` file to map localhost to a custom domain and set up a local HTTPS environment. [mkcert](https://github.com/FiloSottile/mkcert) can help you for setting up local HTTPS.

## Compose the connector JSON

You need to use the identifier that fills in the [Create an identifier](#create-an-identifier) section to compose the JSON:

```json
{
  "clientId": "io.logto.test"
}
```

> ℹ️ **Note**
> 
> This connector doesn't support customizing `scope` (e.g., name, email) yet since Apple requires `form_post` response mode when `scope` is not empty, which is incompatible with the current connector design.
> 
> We'll figure out this later.

## Test Apple connector

That's it. The Apple connector should be available in both web and native apps. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in#enable-connector-in-sign-in-experience).

# Apple 连接器

## 开始上手

如果你还不知道连接器的概念，或者还不知道如何将本连接器添加至你的「登录体验」，请先参见 [Logto 教程](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-social-sign-in)。

> ℹ️ **Note**
> 
> 如果你的应用有其他的社交登录方式，AppStore 要求必须同时有 Apple 登录。
> 如果同时提供 Android 应用，在 Android 设备上同时提供 Apple 登录会让用户体验很棒。

在继续前，你需要加入 [Apple Developer Program](https://developer.apple.com/programs/)。

### 为你的应用启用「通过 Apple 登录」

> ⚠️ **Caution**
> 
> 即使你只想在 web 应用中实现「通过 Apple 登录」，你仍需要拥有一个拥抱 AppStore 生态的应用（即：有一个有效的 App ID）。

你可以通过 Xcode -> Project settings -> Signing & Capabilities 来启用，或者访问 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/bundleId)。

![Enable Sign in with Apple](/packages/connector-apple/docs/enable-sign-in-with-apple-in-xcode.png)

参见 [Apple 官方文档](https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple) 里的「Enable an App ID」章节以了解更多。

### 创建一个 identifier

1. 访问 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/serviceId)，并点按在「Identifier」旁边的「+」按钮。
2. 在「Register a new identifier」页面，选择「Services IDs」并点按「Continue」。
3. 填写「Description」与「Identifier」（例如 `Logto Test` 和 `io.logto.test`），并点按「Continue」。
4. 再次检查相关信息并点按「Register」。

### 为你的 identifier 启用「通过 Apple 登录」

点按你刚刚创建的 identifier。在详情页勾选「Sign in with Apple」并点按「Configure」。

![Enable Sign in with Apple](/packages/connector-apple/docs/enable-sign-in-with-apple.png)

在打开的对话框中，选择刚刚启用了「通过 Apple 登录」的 App ID。

输入你的 Logto 实例域名（不含协议和端口），例如 `your.logto.domain`；并输入「Return URL」（即 Redirect URI）。Return URL 的值是 Logto URL 加上 `/callback/apple-universal`，例如 `https://your.logto.domain/callback/apple-universal`。

![domain-and-url](/packages/connector-apple/docs/domain-and-url.png)

点按「Next」以及「Done」以关闭对话框。点按右上角的「Continue」，接着点按「Save」以保存你的配置。

> ⚠️ **Caution**
> 
> Apple _不允许_ HTTP 协议或 `localhost` 域名作为 Return URL。
> 
> 如果你想在本地进行测试，你需要编辑 `/etc/hosts` 文件以映射 localhost 到一个自定义域名，并设置一个本地的 HTTPS 环境。[mkcert](https://github.com/FiloSottile/mkcert) 可以帮助你设置本地 HTTPS。

## 编写连接器的 JSON

你需要使用在 [创建一个 identifier](#创建一个-identifier) 章节中填写的 identifier 来编写此 JSON：

```json
{
  "clientId": "io.logto.test"
}
```

> ℹ️ **Note**
> 
> 本连接器暂时不支持自定义 `scope`（例如 name，email）。因为在 `scope` 非空时，Apple 要求 `response_mode` 为 `form_post`，与现在连接器的设计不兼容。
> 
> 我们将稍后解决这个问题。

## 测试 Apple 连接器

大功告成。Apple 连接器应该在 web 和原生应用中都可用了。别忘了 [在登录体验中启用本连接器](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-social-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8)。
