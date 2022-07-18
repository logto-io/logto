# Github connector

The official Logto connector for GitHub social sign-in.

GitHub 社交登录 Logto 官方连接器 [中文文档](#github-连接器)

**Table of contents**

- [Github connector](#github-connector)
  - [Get started](#get-started)
  - [Sign in with GitHub account](#sign-in-with-github-account)
  - [Create and configure OAuth app](#create-and-configure-oauth-app)
  - [Managing OAuth apps](#managing-oauth-apps)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Config types](#config-types)
  - [Test GitHub connector](#test-github-connector)
  - [Reference](#reference)
- [GitHub 连接器](#github-连接器)
  - [开始上手](#开始上手)
  - [登录 GitHub 账号](#登录-github-账号)
  - [创建并配置 OAuth 应用程序](#创建并配置-oauth-应用程序)
  - [管理 OAuth 应用程序](#管理-oauth-应用程序)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [配置类型](#配置类型)
  - [测试 GitHub 连接器](#测试-github-连接器)
  - [参考](#参考)

## Get started

The GitHub connector enables end-users to sign in to your application using their own GitHub accounts via GitHub OAuth 2.0 authentication protocol.

## Sign in with GitHub account

Go to the [GitHub website](https://github.com/) and sign in with your GitHub account. You may register a new account if you don't have one.

## Create and configure OAuth app

Follow the [creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) guide, and register a new application.

Name your new OAuth application in **Application name** and fill up **Homepage URL** of the app.
You can leave **Application description** field blank and customize **Authorization callback URL** as `${your_logto_origin}/callback/github-universal`.

We suggest not to check the box before **Enable Device Flow**, or users who sign in with GitHub on mobile devices must confirm the initial sign-in action in the GitHub app. Many GitHub users do not install the GitHub mobile app on their phones, which could block the sign-in flow. Please ignore our suggestion if you are expecting end-users to confirm their sign-in flow. See details of [device flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow).

## Managing OAuth apps

Go to the [OAuth Apps page](https://github.com/settings/developers) and you can add, edit or delete existing OAuth apps.
You can also find `Client ID` and generate `Client secrets` in OAuth app detail pages.

## Compose the connector JSON

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _Client Secret_ you've got from OAuth app detail pages mentioned in the previous section.

Here is an example of GitHub connector config JSON.

```json
{
  "clientID": "<your-client-id>",
  "clientSecret": "<your-client-secret>"
}
```

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |


## Test GitHub connector

That's it. The GitHub connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in#enable-connector-in-sign-in-experience).

## Reference

- [GitHub - Developers - Apps](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps)
- [GitHub - Developers - Apps - Creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)

# GitHub 连接器

## 开始上手

GitHub 连接器让终端用户可以用 GitHub 账号，通过 GitHub OAuth 2.0 授权协议来登录你的应用。

## 登录 GitHub 账号

前往 [GitHub 网站](https://github.com/) 并登录你的 GitHub 帐号。

## 创建并配置 OAuth 应用程序

跟随 [创建 _OAuth 应用程序_](https://docs.github.com/cn/developers/apps/building-oauth-apps/creating-an-oauth-app)，注册一个新应用。

为新 _OAuth 应用程序_ 取名，并填入「Application name」栏；并填写应用的网页地址「Homepage URL」。
你需要将 `${your_logto_origin}/callback/github-universal` 填写到「Authorization callback URL」栏；「Application description」栏可以选择留白。

我们建议不要勾选「Enable Device Flow」，否则希望在移动设备上登录的用户需要在 GitHub 应用中确认登录的动作。许多 GitHub 用户在移动端设备上不会安装应用，这可能阻碍这些用户的登录流程。

如果你的确期望终端用户在移动设备上需要有确认登录的动作，请忽略我们的建议。查看更多关于 [设备流程](https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow) 的详情。

## 管理 OAuth 应用程序

前往 [OAuth Apps](https://github.com/settings/developers)，你可以添加新应用或者修改、删除已存在的 _OAuth 应用程序_。

在应用详情页，你能找到 `Client ID` 和 `Client secrets`（如果没有可以点击「Generate a new client secret」生成新的）。

## 编写连接器的 JSON

用你从上一步 OAuth 应用程序详情页获取到的 _Client ID_ 和 _Client Secret_ 分别填写 `clientId` 和 `clientSecret`。

以下是一个 GitHub 连接器配置 JSON 的样例。

```json
{
  "clientID": "<your-client-id>",
  "clientSecret": "<your-client-secret>"
}
```

### 配置类型

| 名称         | 类型    |
|--------------|--------|
| clientId     | string |
| clientSecret | string |

## 测试 GitHub 连接器

大功告成！GitHub 连接器现在可以正常使用了。
别忘了 [在登录体验中启用本连接器](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-social-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8)。

## 参考

- [GitHub - 开发者 - 应用](https://docs.github.com/cn/developers/apps/getting-started-with-apps/about-apps)
- [GitHub - 开发者 - 应用 - 创建 OAuth 应用程序](https://docs.github.com/cn/developers/apps/building-oauth-apps/creating-an-oauth-app)
