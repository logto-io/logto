# DingTalk Web Connector

The official Logto connector for DingTalk social sign-in in web apps.

钉钉 web 应用社交登录官方 Logto 连接器 [中文文档](#钉钉网页连接器)

**Table of contents**

- [DingTalk Web Connector](#dingtalk-web-connector)
  - [Get Started](#get-started)
  - [Create a Web App in the DingTalk Open Platform](#create-a-web-app-in-the-dingtalk-open-platform)
    - [Register a DingTalk Developer Account](#register-a-dingtalk-developer-account)
    - [Create an Application](#create-an-application)
    - [Configure Permissions](#configure-permissions)
    - [Release Application](#release-application)
  - [Configure Your Connector](#configure-your-connector)
    - [Config Types](#config-types)
  - [Test DingTalk Connector](#test-dingtalk-connector)
  - [Support](#support)
- [钉钉网页连接器](#钉钉网页连接器)
  - [开始上手](#开始上手)
  - [在钉钉开放平台新建一个应用](#在钉钉开放平台新建一个应用)
    - [注册钉钉开发者账号](#注册钉钉开发者账号)
    - [创建应用](#创建应用)
    - [配置权限](#配置权限)
    - [应用发布](#应用发布)
  - [配置你的连接器](#配置你的连接器)
    - [配置类型](#配置类型)
  - [测试钉钉连接器](#测试钉钉连接器)
  - [支持](#支持)

## Get started

The DingTalk web connector is designed for desktop web applications. It uses the OAuth 2.0 authentication flow.

## Create a web app in the DingTalk Open Platform

> 💡 **Tip**
> You can skip some sections if you have already finished.

### Register a DingTalk developer account

If you do not have a DingTalk developer account, please register at the [DingTalk Open Platform](https://open.dingtalk.com).

### Create an application

1. In the DingTalk Open Platform "[Application Development](https://open-dev.dingtalk.com/fe/app)" > "Internal Enterprise Application" > "DingTalk Application", click "Create Application"
2. Fill in the **application name** and **description**, and click "Save"
3. In the left navigation bar, select "Development Configuration" > "Security Settings", find and configure the "Redirect URL" `${your_logto_origin}/callback/${connector_id}`. You can find the `connector_id` on the connector details page after adding the respective connector in the management console
4. In the left navigation bar, select "Basic Information" > "Credentials and Basic Information" to get the `Client ID` and `Client Secret`

### Configure permissions

In "Development Configuration" > "Permission Management", select `Contact.User.Read` and `Contact.User.mobile` permissions and authorize them

### Release Application

In the left navigation bar, select "Application Release" > "Version Management and Release", create and release the first version to activate the `Client ID` and `Client Secret`

> ℹ️ **Note**
> If the application does not release a version, the obtained "Client ID" and "Client Secret" cannot be used, or requests will fail.

## Configure your connector

Fill out the `clientId` and `clientSecret` field with _Client ID(formerly AppKey and SuiteKey)_ and _Client Secret(formerly AppKey and SuiteKey)_ you've got from OAuth app detail pages mentioned in the previous section.

`scope` currently supports two values: `openid` and `openid corpid`. `openid` allows obtaining the user's `userid` after authorization, while `openid corpid` allows obtaining both the user's `id` and the organization `id` selected during the login process. The values should be space-delimited. Note: URL encoding is required.

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test DingTalk connector

That's it. The DingTalk connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

Once DingTalk web connector is enabled, you can sign in to your app again to see if it works.

> ℹ️ **Note**
> Please ensure strict compliance with the usage specifications and development guidelines of the DingTalk Open Platform during the development process.

## Support

If you have any questions or need further assistance, please visit the [DingTalk Developer Documentation](https://open.dingtalk.com/document/orgapp/obtain-identity-credentials) or contact DingTalk technical support.

# 钉钉网页连接器

## 开始上手

钉钉网页连接器是为桌面网页应用设计的。它采用了 OAuth 2.0 认证流程。

## 在钉钉开放平台新建一个应用

> 💡 **Tip**
> 你可以跳过已经完成的部分。

### 注册钉钉开发者账号

如果你还没有钉钉开发者账号，请在 [钉钉开放平台](https://open.dingtalk.com) 注册。

### 创建应用

1. 在 钉钉开放平台「[应用开发](https://open-dev.dingtalk.com/fe/app)」>「企业内部应用」>「钉钉应用」中，点击「创建应用」
2. 填写**应用名称**和**应用描述**，点击「保存」
3. 在左侧导航栏选择「开发配置」>「安全设置」，找到并配置「重定向 URL」 `${your_logto_origin}/callback/${connector_id}`。其中 `connector_id` 在管理控制台添加了相应的连接器之后，可以在连接器的详情页中找到
4. 在左侧导航栏选择「基础信息」>「凭证与基础信息」中可以获取「Client ID」、「Client Secret」

### 配置权限

在「开发配置」>「权限管理」中，选择`通讯录个人信息读权限`和`个人手机号信息`权限并进行授权

### 应用发布

在左侧导航栏选择「应用发布」>「版本管理与发布」，点击「创建新版本」发布第一个版本，以使「Client ID」、「Client Secret」生效

> ℹ️ **Note**
> 应用不发布版本，所获取的「Client ID」、「Client Secret」 均无法使用，或请求错误。

## 配置你的连接器

在 `clientId` 和 `clientSecret` 字段中填入你在上一个部分中提到的 OAuth 应用详情页面获取的 _Client ID_（原 AppKey 和 SuiteKey）和 _Client Secret_（原 AppKey 和 SuiteKey）。

`scope` 目前支持两种值：`openid` 和 `openid corpid`。`openid` 授权后可以获取用户的 `userid`，而 `openid corpid` 授权后可以获取用户的 `id` 和登录过程中用户选择的组织 `id`。这些值应以空格分隔。注意：需要进行 URL 编码。

### 配置类型

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |

## 测试钉钉连接器

大功告成。别忘了 [在登录体验中启用本连接器](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/)。

在钉钉web连接器启用后，你可以构建并运行你的应用看看是否生效。

> ℹ️ **Note**
> 请确保在开发过程中，严格遵守钉钉开放平台的使用规范和开发指南。

## 支持

如有任何问题或需进一步帮助，请访问 [钉钉开发者文档](https://open.dingtalk.com/document/orgapp/obtain-identity-credentials) 或联系钉钉技术支持。
