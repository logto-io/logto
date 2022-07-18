# Github connector

The official Logto connector for GitHub social sign-in.

GitHub 社交登录 Logto 官方连接器 [中文文档](#github-连接器)

**Table of contents**

- [Github connector](#github-connector)
  - [Get started](#get-started)
    - [Sign in with GitHub account](#sign-in-with-github-account)
    - [Create, config and manage apps](#create-config-and-manage-apps)
      - [Create and configure OAuth app](#create-and-configure-oauth-app)
      - [Managing OAuth apps](#managing-oauth-apps)
      - [Create and configure GitHub app](#create-and-configure-github-app)
      - [Managing GitHub apps](#managing-github-apps)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Config types](#config-types)
  - [Test GitHub connector](#test-github-connector)
  - [Reference](#reference)
- [GitHub 连接器](#github-连接器)
  - [开始上手](#开始上手)
    - [登录 GitHub 账号](#登录-github-账号)
    - [创建、配置和管理应用](#创建配置和管理应用)
      - [创建并配置 OAuth 应用程序](#创建并配置-oauth-应用程序)
      - [管理 OAuth 应用程序](#管理-oauth-应用程序)
      - [创建并配置 GitHub 应用程序](#创建并配置-github-应用程序)
      - [管理 GitHub 应用程序](#管理-github-应用程序)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [配置类型](#配置类型)
  - [测试 GitHub 连接器](#测试-github-连接器)
  - [参考](#参考)

## Get started

The GitHub connector enables end-users to have access to your application using their own GitHub accounts via GitHub OAuth 2.0 authentication protocol.

### Sign in with GitHub account

Go to the [GitHub website](https://github.com/) and sign in with your GitHub account. You may register a new account if you don't have one.

### Create, config and manage apps

In GitHub, you can create two different kinds of [apps](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps) (_GitHub App_ and _OAuth App_) as prerequisites before enabling end-users' sign-in.

You may check out [difference between them](https://docs.github.com/en/developers/apps/getting-started-with-apps/differences-between-github-apps-and-oauth-apps) for more details.

#### Create and configure OAuth app

Follow the [creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) guide, and register a new application.

Name your new OAuth application in **Application name** and fill up **Homepage URL** of the app.
You can leave **Application description** field blank and customize **Authorization callback URL** as `${your_logto_origin}/callback/github-universal`.

#### Managing OAuth apps

Go to the [OAuth Apps page](https://github.com/settings/developers) and you can add, edit or delete existing OAuth apps.
You can also find `Client ID` and generate `Client secrets` in OAuth app detail pages.

#### Create and configure GitHub app

Follow the [creating an GitHub App](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app) guide, and register a new application.

Name your new GitHub application in **GitHub App name** and fill up **Homepage URL** of the app.
You can leave application description field blank and customize **Callback URL** as `${your_logto_origin}/callback/github-universal`.

> 💡 **Tip**
> 
> You can have multiple _callback URLs_ in GitHub apps but only one _callback URL_ for OAuth apps.

> ℹ️ **Note**
> 
> You may check the box before **Enable Device Flow** to allow users to authorize via the App. For more details, check [here](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow).

#### Managing GitHub apps

Go to the [GitHub Apps page](https://github.com/settings/apps) and you can add, edit or delete existing GitHub apps.
You can also find `Client ID` and generate `Client secrets` in GitHub app detail pages.

## Compose the connector JSON

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _Client Secret_ you've got from OAuth (or GitHub) app detail pages mentioned in the previous section.

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
- [GitHub - Developers - Apps - Differences between GitHub Apps and OAuth Apps](https://docs.github.com/en/developers/apps/getting-started-with-apps/differences-between-github-apps-and-oauth-apps)
- [GitHub - Developers - Apps - Creating a GitHub App](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app)
- [GitHub - Developers - Apps - Creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)

# GitHub 连接器

## 开始上手

GitHub 连接器让终端用户可以用 GitHub 账号，通过 GitHub OAuth 2.0 授权协议来访问你的应用。

### 登录 GitHub 账号

前往 [GitHub 网站](https://github.com/) 并登录你的 GitHub 帐号。

### 创建、配置和管理应用

在 GitHub，你可以创建两种不同种类的 [应用](https://docs.github.com/cn/developers/apps/getting-started-with-apps/about-apps)（_GitHub 应用程序_ 和 _OAuth 应用程序_）。若要让终端用户能够正常登录，它们是必不可少的。

你可以花一点时间阅读 [_GitHub 应用程序_ 和 _OAuth 应用程序_ 之间的差异
](https://docs.github.com/cn/developers/apps/getting-started-with-apps/differences-between-github-apps-and-oauth-apps) 以了解更多。

#### 创建并配置 OAuth 应用程序

跟随 [创建 _OAuth 应用程序_](https://docs.github.com/cn/developers/apps/building-oauth-apps/creating-an-oauth-app)，注册一个新应用。

为新 _OAuth 应用程序_ 取名，并填入「Application name」栏；并填写应用的网页地址「Homepage URL」。
你需要将 `${your_logto_origin}/callback/github-universal` 填写到「Authorization callback URL」栏；「Application description」栏可以选择留白。

#### 管理 OAuth 应用程序

前往 [OAuth Apps](https://github.com/settings/developers)，你可以添加新应用或者修改、删除已存在的 _OAuth 应用程序_。

在应用详情页，你能找到 `Client ID` 和 `Client secrets`（如果没有可以点击「Generate a new client secret」生成新的）。

#### 创建并配置 GitHub 应用程序

跟随 [创建 _GitHub 应用程序_](https://docs.github.com/cn/developers/apps/building-github-apps/creating-a-github-app)，注册一个新应用。

为新的 _GitHub 应用程序_ 取名，填入「GitHub App name」栏；并填写应用的网页地址「Homepage URL」。
你需要将 `${your_logto_origin}/callback/github-universal` 填写到「Callback URL」栏；「Application description」栏可以选择留白。

> 💡 **小贴士**
> 
> GitHub 应用程序可以有多个 _callback URL_ 但是 OAuth 应用程序只能有单个 _Authorization callback URL_。

> ℹ️ **注意**
> 
> 你可以勾选「Enable Device Flow」让用户可以通过 GitHub 应用程序授权。查看「[设备流程](https://docs.github.com/cn/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow)」了解更多。

#### 管理 GitHub 应用程序

前往 [_GitHub 应用程序_](https://github.com/settings/apps)，你可以添加新应用或者修改、删除已存在的 _GitHub 应用程序_。

在应用详情页，你能找到 `Client ID` 和 `Client secrets`（如果没有可以点击「Generate a new client secret」生成新的）。

## 编写连接器的 JSON

用你从上一步 OAuth（或 GitHub）应用程序详情页获取到的 _Client ID_ 和 _Client Secret_ 分别填写 `clientId` 和 `clientSecret`。

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
- [GitHub - 开发者 - 应用 - GitHub 应用程序和 OAuth 应用程序之间的差异](https://docs.github.com/cn/developers/apps/getting-started-with-apps/differences-between-github-apps-and-oauth-apps)
- [GitHub - 开发者 - 应用 - 创建 GitHub 应用程序](https://docs.github.com/cn/developers/apps/building-github-apps/creating-a-github-app)
- [GitHub - 开发者 - 应用 - 创建 OAuth 应用程序](https://docs.github.com/cn/developers/apps/building-oauth-apps/creating-an-oauth-app)
