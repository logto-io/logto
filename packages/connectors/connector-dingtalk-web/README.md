# DingTalk Web Connector

An advanced enterprise collaboration and management platform. Seamless office collaboration in one place, aligning team goals from top to bottom, and fully activating the organization and individuals.

## Getting started

The DingTalk web connector is designed for desktop web applications. It uses the OAuth 2.0 authentication flow.

## Register a DingTalk developer account

If you do not have a DingTalk developer account, please register at the [DingTalk Open Platform](https://open.dingtalk.com).

## Create an application

1. In the [DingTalk Developer Console](https://open-dev.dingtalk.com/console/index), click "Create Application"
2. Choose "Self-built Application", fill in the application name and basic information, and click "Create"
3. In the left navigation bar, select "Development Configuration" -> "Security Settings", find and configure the "Redirect URL" `${your_logto_origin}/callback/${connector_id}`. You can find the `connector_id` on the connector details page after adding the respective connector in the management console
4. In the left navigation bar, select "Basic Information" -> "Credentials and Basic Information" to get the "Client ID" and "Client Secret"
5. In the left navigation bar, select "Application Release" -> "Version Management and Release", create and release the first version to activate the "Client ID" and "Client Secret"

> ℹ️ **Note**
> If the application does not release a version, the obtained "AppKey" and "AppSecret" cannot be used, or requests will fail.

## Configure permissions

1. In "Development Configuration" -> "Permission Management", select `Contact.User.Read` and `Contact.User.mobile` permissions and authorize them
2. After confirming the permission configuration, click "Save" and publish the application

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

That's it. The DingTalk connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-social-sign-in).

> ℹ️ **Note**
> Please ensure strict compliance with the usage specifications and development guidelines of the DingTalk Open Platform during the development process.

## Support

If you have any questions or need further assistance, please visit the [DingTalk Developer Documentation](https://open.dingtalk.com/document/orgapp/obtain-identity-credentials) or contact DingTalk technical support.

# 钉钉网页连接器

先进企业协作与管理平台，一站式无缝办公协作，团队上下对齐目标，全面激活组织和个人。

## 开始上手

钉钉网页连接器是为桌面网页应用设计的。它采用了 OAuth 2.0 认证流程。

## 注册钉钉开发者账号

如果你还没有钉钉开发者账号，请在 [钉钉开放平台](https://open.dingtalk.com) 注册。

## 创建应用

1. 在 [钉钉开发者后台](https://open-dev.dingtalk.com/console/index) 中，点击「创建应用」
2. 选择「自建应用」，填写应用名称和基本信息，点击「创建」
3. 在左侧导航栏选择「开发配置」->「安全设置」，找到并配置「重定向 URL」 `${your_logto_origin}/callback/${connector_id}`。其中 `connector_id` 在管理控制台添加了相应的连接器之后，可以在连接器的详情页中找到
4. 在左侧导航栏选择「基础信息」->「凭证与基础信息」中可以获取「Client ID」、「Client Secret」
5. 在左侧导航栏选择「应用发布」->「版本管理与发布」，创建并发布第一个版本，以使「Client ID」、「Client Secret」生效

> ℹ️ **Note**
> 应用不发布版本，所获取的「AppKey」、「AppSecret」 均无法使用，或请求错误。

## 配置权限

1. 在「开发配置」->「权限管理」中，选择`通讯录个人信息读权限`和`个人手机号信息`权限并进行授权
2. 确认权限配置后，点击「保存」并发布应用

## 配置你的连接器

在 clientId 和 clientSecret 字段中填入你在上一个部分中提到的 OAuth 应用详情页面获取的 Client ID(原 AppKey 和 SuiteKey) 和 Client Secret(原 AppKey 和 SuiteKey) 。

scope 目前支持两种值：openid 和 openid corpid。openid 授权后可以获取用户的 userid，而 openid corpid 授权后可以获取用户的 id 和登录过程中用户选择的组织 id。这些值应以空格分隔。注意：需要进行 URL 编码。

## 配置类型

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
| scope        | string |

> ℹ️ **Note**
> 请确保在开发过程中，严格遵守钉钉开放平台的使用规范和开发指南。

## 支持

如有任何问题或需进一步帮助，请访问 [钉钉开发者文档](https://open.dingtalk.com/document/orgapp/obtain-identity-credentials) 或联系钉钉技术支持。
