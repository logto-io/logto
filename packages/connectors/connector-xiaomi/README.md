# Xiaomi social connector

The official Logto connector for Xiaomi social sign-in.

小米社交登录 Logto 官方连接器 [中文文档](#小米社交连接器)

**Table of contents**

- [Xiaomi social connector](#xiaomi-social-connector)
  - [Get started](#get-started)
  - [Configure Xiaomi OAuth application](#configure-xiaomi-oauth-application)
  - [Scopes description](#scopes-description)
  - [Test Xiaomi connector](#test-xiaomi-connector)
  - [References](#references)
- [小米社交连接器](#小米社交连接器)
  - [开始上手](#开始上手)
  - [配置小米 OAuth 应用](#配置小米-oauth-应用)
  - [权限范围说明](#权限范围说明)
  - [测试小米连接器](#测试小米连接器)
  - [参考](#参考)

## Get started

1. Create a developer account at [Xiaomi Open Platform](https://dev.mi.com/)
2. Visit [Xiaomi Account Service](https://dev.mi.com/passport/oauth2/applist)
3. Create a new application if you don't have one

## Configure Xiaomi OAuth application

1. Visit [Xiaomi Account Service](https://dev.mi.com/passport/oauth2/applist)
2. Configure OAuth settings:
   - Open the application you want to use for login, click on "Callback URL" (if you haven't edited the callback URL, it will display as "Enabled")
   - Add authorization callback URL: `${your_logto_origin}/callback/${connector_id}`
   - `connector_id` can be found on the top of the connector details page in Logto Console
3. Get `AppID` and `AppSecret` from the application details page
5. Fill in the `clientId` and `clientSecret` fields in Logto Console with the values from step 3
6. Optional configuration:
   - `skipConfirm`: Whether to skip the Xiaomi authorization confirmation page when user is already logged in to Xiaomi account, defaults to false

## Scopes description

By default, the connector requests the following scope:

- `1`: Read user profile

Available scopes:

| Scope Value | Description | API Interface |
|-------------|-------------|---------------|
| 1 | Get user profile | user/profile |
| 3 | Get user open_id | user/openIdV2 |
| 1000 | Get Xiaomi router info | Mi Router |
| 1001 | Access all Xiaomi router info | Mi Router |
| 2001 | Access Xiaomi cloud calendar | Mi Cloud |
| 2002 | Access Xiaomi cloud alarm | Mi Cloud |
| 6000 | Use Mi Home smart home service | Mi Home |
| 6002 | Add third-party devices to Mi Home | Mi Home |
| 6003 | Alexa control Xiaomi devices | Mi Home |
| 6004 | Third-party service access to Xiaomi devices | Mi Home |
| 7000 | Follow Yellow Pages service account | Mi Cloud |
| 11000 | Get Xiaomi cloud photos | Mi Cloud |
| 12001 | Save app data to Mi Cloud | Mi Cloud |
| 12005 | Use health ECG service | Health |
| 16000 | Get Mi Wallet passes | app/get_pass |
| 20000 | Enable XiaoAI voice service | XiaoAI |
| 40000 | Enable cloud AI service | Internal Use |

Multiple scopes can be configured by separating them with spaces, e.g.: `1 3 6000`.

## Test Xiaomi connector

That's it. Don't forget to [Enable social sign-in](https://docs.logto.io/connectors/social-connectors#enable-social-sign-in) in the sign-in experience.

## References

- [Xiaomi OAuth 2.0 Documentation](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1708)
- [Xiaomi Get User Profile Documentation](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1517)

# 小米社交连接器

小米是一家全球知名的科技公司，提供包括智能手机、智能家居等在内的多种产品和服务。本连接器可以帮助终端用户使用小米账号登录你的应用。

## 开始上手

1. 在[小米开放平台](https://dev.mi.com/)创建开发者账号
2. 访问[小米帐号服务](https://dev.mi.com/passport/oauth2/applist)
3. 创建一个新应用（如果还没有）

## 配置小米 OAuth 应用

1. 访问[小米帐号服务](https://dev.mi.com/passport/oauth2/applist)
2. 配置 OAuth 设置:
   - 打开要用于登录的应用，点击「回调地址」（如果没有编辑过回调地址，会显示为「启用」）
   - 添加授权回调地址: `${your_logto_origin}/callback/${connector_id}`
   - `connector_id` 可以在 Logto 管理控制台连接器详情页顶部找到
3. 从应用详情页获取 `AppID` 和 `AppSecret`
4. 将第 3 步获取的值填入 Logto 管理控制台的 `clientId` 和 `clientSecret` 字段
5. 可选配置:
   - `skipConfirm`: 在用户已登录小米账号的情况下，是否跳过小米授权确认页面，默认为 false

## 权限范围说明

默认情况下，连接器请求以下权限:

- `1`: 读取用户资料

可配置的权限范围:

| 权限值 | 描述 | API 接口 |
|-------|------|----------|
| 1 | 获取用户资料 | user/profile |
| 3 | 获取用户 open_id | user/openIdV2 |
| 1000 | 获取小米路由器信息 | 路由器 |
| 1001 | 访问所有小米路由器信息 | 路由器 |
| 2001 | 访问小米云日历 | 小米云 |
| 2002 | 访问小米云闹钟 | 小米云 |
| 6000 | 使用米家智能家居服务 | 米家 |
| 6002 | 添加第三方设备到米家 | 米家 |
| 6003 | Alexa 控制小米设备 | 米家 |
| 6004 | 第三方服务访问小米设备 | 米家 |
| 7000 | 关注黄页服务号 | 小米云 |
| 11000 | 获取小米云相册 | 小米云 |
| 12001 | 保存应用数据到小米云 | 小米云 |
| 12005 | 使用健康心电图服务 | 健康 |
| 16000 | 获取小米卡包卡券 | app/get_pass |
| 20000 | 启用小爱智能语音服务 | 小爱 |
| 40000 | 启用云端 AI 服务 | 内部使用 |

可以通过空格分隔配置多个权限范围，例如: `1 3 6000`。

## 测试小米连接器

大功告成！别忘了在[登录体验](https://docs.logto.io/zh-CN/connectors/social-connectors#enable-social-sign-in)中启用该连接器。

## 参考

- [小米 OAuth 2.0 文档](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1708)
- [小米获取用户信息文档](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1517)
