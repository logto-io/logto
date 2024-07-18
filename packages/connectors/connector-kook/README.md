# KOOK connector

The official Logto connector for KOOK social sign-in web apps.

KOOK 应用社交登录官方 Logto 连接器 [中文文档](#kook-连接器)

**Table of contents**
- [KOOK connector](#kook-connector)
  - [Get started](#get-started)
  - [Create an Application in the KOOK Developer Center](#create-an-application-in-the-kook-developer-center)
  - [Configure your KOOK connector](#configure-your-kook-connector)
    - [Config types](#config-types)
  - [Test KOOK connector](#test-kook-connector)
  - [Reference](#reference)
- [KOOK 连接器](#kook-连接器)
  - [配置你的 KOOK 连接器](#配置你的-kook-连接器)
    - [配置类型](#配置类型)
  - [测试 KOOK 连接器](#测试-kook-连接器)
  - [参考](#参考)


## Get started

KOOK connector enables end-users to sign in to your application using their own KOOK account via KOOK OAuth 2.0 authentication protocol.

## Create an Application in the KOOK Developer Center

> 💡 **Tip**
> You can skip some sections if you have already finished.

> 💥 **Warning**
> You need to apply for KOOK OAuth2 permission before creating an OAuth2 Application. Please check out the information on the OAuth2 page or ask KOOK's staff in KOOK official developer server for more information.
> 
> ![OAuth2 permission required page](/packages/connectors/connector-kook/docs/oauth2-permission-required-page.png)

1. Go to [KOOK Developer Center (KOOK 开发者中心)](https://developer.kookapp.cn/app/index) and sign in with your KOOK account. You may register a new account if you don't have one.
2. Click the **Create Application (新建应用)** button to create an application, choose a name for it (Ex: LogtoAuth) and click **Confirm (确定)**
3. Click the application icon you created, and go to **OAuth2** page.
4. Add the valid redirects (Ex: `${your_logto_origin}/callback/${connector_id}`) in the **Callback URIs (回调地址)** fields. You can find the redirect uri in the logto admin console connector details page.
5. Don't forget to check the **get_user_info** scope in the **OAuth2 link builder (OAuth2 链接生成器)**。

![OAuth2 link builder (OAuth2 链接生成器)](/packages/connectors/connector-kook/docs/oauth2-link-builder.png)

## Configure your KOOK connector

Fill out the clientId and clientSecret field with Client ID and Client Secret you've got from OAuth2 page mentioned in the previous section.

### Config types

| Name         | Type   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## Test KOOK connector

That's it. The KOOK connector should be available now. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

## Reference

- [KOOK Developer Center - OAuth2](https://developer.kookapp.cn/doc/oauth2)

# KOOK 连接器

> 💡 **Tip**
> 
> 你可以跳过已经完成的部分。

> 💥 **Warning**
> 在创建 OAuth2 应用之前，你需要向 KOOK 申请 OAuth2 权限。如何申请请参考 OAuth2 页上的信息或在 KOOK 官方开发者服务器咨询 KOOK 工作人员。
>
> ![需要授权 OAuth2 权限](/packages/connectors/connector-kook/docs/oauth2-permission-required-page.png)

1. 打开 [KOOK 开发者中心](https://developer.kookapp.cn/app/index) 并登录你的 KOOK 最后。如果你没有注册账号，注册一个！
2. 点击 **新建应用** 按钮创建一个新的应用，然后给你的应用起一个名字（如：LogtoAuth）然后点击 **确定**。
3. 点击你刚刚创建的应用的图标，切换到 **OAuth2** 页面。
4. 在 **回调地址** 一栏填入你的 Callback URI（比如说：`${your_logto_origin}/callback/${connector_id}`）。你可以在 Logto 控制台的连接器详细页找到你的 Callback URI。
5. 不要忘记在 **OAuth2 链接生成器** 勾选 **get_user_info** scope。

![OAuth2 链接生成器](/packages/connectors/connector-kook/docs/oauth2-link-builder.png)

## 配置你的 KOOK 连接器

分别用 OAuth 应用详情页面中的 **Client ID** 和 **Client Secret** 字段填写 `clientId` 和 `clientSecret` 字段。

### 配置类型

| 名称         | 类型   |
| ------------ | ------ |
| clientId     | string |
| clientSecret | string |
| scope        | string |

## 测试 KOOK 连接器

大功告成。别忘了 [在登录体验中启用本连接器](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/)。

在 KOOK 连接器启用后，你可以构建并运行你的应用看看是否生效。

## 参考

- [KOOK 开发者中心 - OAuth2](https://developer.kookapp.cn/doc/oauth2)
