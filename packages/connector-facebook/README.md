# Facebook connector

The official Logto connector for Facebook social sign-in.

Facebook 社交登录 Logto 官方连接器 [中文文档](#facebook-社交连接器)

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
- [Facebook 社交连接器](#facebook-社交连接器)
  - [开始上手](#开始上手)
    - [创建一个 Facebook 开发者帐号](#创建一个-facebook-开发者帐号)
    - [创建并设置一个 Facebook 应用](#创建并设置一个-facebook-应用)
  - [编写连接器的 JSON](#编写连接器的-json)
  - [用 Facebook 的测试用户来测试登录](#用-facebook-的测试用户来测试登录)
  - [发布 Facebook 应用](#发布-facebook-应用)
  - [配置类型](#配置类型)
  - [参考](#参考)

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
5. In the Facebook Login Settings page, fill `${your_logto_origin}/callback/facebook-universal` in the "Valid OAuth Redirect URIs" field. E.g.:
    - `https://logto.dev/callback/facebook-universal` for production
    - `https://localhost:3001/callback/facebook-universal` for testing in the local environment
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

# Facebook 社交连接器

## 开始上手

Facebook 连接器为你提供了通过 Facebook 的 OAuth 2.0 授权系统注册、登录的方法。

### 创建一个 Facebook 开发者帐号

[注册帐号并成为 Facebook 开发者](https://developers.facebook.com/docs/development/register/?locale=zh_CN)。

### 创建并设置一个 Facebook 应用

1. 访问 [应用](https://developers.facebook.com/apps)。
2. 点按你已存在的应用或者按需 [创建应用](https://developers.facebook.com/docs/development/create-an-app)。
   - 由你来选择合适的 [应用类型](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/app-types)，但需要包含 _Facebook 登录_ 产品。
3. 在应用「控制面板」，在侧边栏找到「添加产品」部分，然后点按「Facebook 登录」卡片上的「设置」按钮。
4. 跳过 Facebook 登录快速启动页，然后点击侧边栏 -> 「产品」->「Facebook 登录」->「设置」。
5. 在 Facebook 登录设置页，在「跳转 URI 来检查」栏中填入 `${your_logto_origin}/callback/facebook-universal`，例如：
   - 在产品环境中可以填：`https://logto.dev/callback/facebook-universal`
   - 在本地测试环境中可以填：`https://localhost:3001/callback/facebook-universal`
6. 点按页面右下角的「保存更改」按钮。

## 编写连接器的 JSON

1. 在 Facebook 应用「控制面板」，从侧边栏，点按「设置」->「基本」。
2. 在面板中你会看到 _应用编号_ 和 _应用密钥_。
3. 点按在「应用秘钥」右边的「显示」按钮，然后复制内容。
4. 填写 Logto 连接器设置：
   - 用 _应用编号_ 里找到的信息填写 `clientId` 栏。
   - 用 _应用密钥_ 中的信息填写 `clientSecret` 栏。

## 用 Facebook 的测试用户来测试登录

你可以用测试帐号、开发者帐号或者管理员帐号在开发环境或者真实环境下测试相关应用的登录流程。了解 [应用模式](https://developers.facebook.com/docs/development/build-and-test/app-modes)。

你可以把应用发布从而让所有 Facebook 用户都能登录应用。

- 在应用的控制面板，从侧边栏 ->「用户身份」->「测试用户」。
- 点按「创建测试用户」按钮来创建一个测试用户。
- 点按已有测试用户的「选项」按钮，你可以看到诸如「更改名字或密码」等更多选项。

## 发布 Facebook 应用

通常，只有测试帐号、开发者帐或者管理员帐号才可以在 [开发者模式](https://developers.facebook.com/docs/development/build-and-test/app-modes#development-mode) 下登录相应的应用。

为了让一般 Facebook 用户可以登录到生产环境，你可能需要将你的 Facebook 应用发布。但这又会随着你的应用类型而有所不同。
例如，_Business_ 类型的应用没有「Live」开关按钮。

1. 在 Facebook 应用「控制面板」，从侧边栏 ->「设置」->「基本」。
2. 按需填写 _隐私权政策网址_ 和 _用户数据删除_ 栏。
3. 点按右下角「保存更改」按钮。
4. 点按应用顶栏的「Live」按钮。

## 配置类型

| 名称         | 类型   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
## 参考

- [Facebook 登录 - 文档 - 面向开发者](https://developers.facebook.com/docs/facebook-login/)
    - [手动构建登录流程](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/)
    - [Facebook 登录的相关权限](https://developers.facebook.com/docs/facebook-login/guides/permissions)
