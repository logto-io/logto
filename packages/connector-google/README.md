# Google connector

The Google connector provides a succinct way for your application to use Google’s OAuth 2.0 authentication system.

Google 连接器为你的应用程序提供了一种接入 Google OAuth 2.0 身份验证系统的简单方式。

**Table of contents**
- [Google connector](#google-connector)
  - [Set up a project in the Google API Console](#set-up-a-project-in-the-google-api-console)
  - [Configure your consent screen](#configure-your-consent-screen)
    - [Configure and register your application](#configure-and-register-your-application)
    - [Edit app registration](#edit-app-registration)
      - [Config OAuth consent screen](#config-oauth-consent-screen)
      - [Config scopes](#config-scopes)
      - [Add test users (External user type only)](#add-test-users-external-user-type-only)
  - [Obtain OAuth 2.0 credentials](#obtain-oauth-20-credentials)
    - [Config types](#config-types)
  - [References](#references)
- [Google 连接器](#google-连接器)
  - [在 Google API 控制台中创建一个项目](#在-google-api-控制台中创建一个项目)
  - [配置 OAuth 同意屏幕](#配置-oauth-同意屏幕)
    - [注册和配置应用](#注册和配置应用)
    - [修改应用注册](#修改应用注册)
      - [设置「OAuth 同意屏幕」](#设置oauth-同意屏幕)
      - [配置权限「范围」](#配置权限范围)
      - [添加「测试用户」（仅「User Type」（用户类型）设置为「外部」时需要）](#添加测试用户仅user-type用户类型设置为外部时需要)
  - [获取 OAuth 2.0 凭据](#获取-oauth-20-凭据)
    - [配置类型](#配置类型)
  - [参考](#参考)

## Set up a project in the Google API Console

- Visit the [Google API Console](https://console.developers.google.com) and sign in with your Google account.
- Click the **Select a project** button on the top menu bar, and click the **New Project** button to create a project.
- In your newly created project, click the **APIs & Services** to enter the **APIs & Services** menu.

## Configure your consent screen

### Configure and register your application

- On the left **APIs & Services** menu, click the **OAuth consent screen** button.
- Choose the **User Type** you want, and click the **Create** button. (Note: If you select **External** as your **User Type**, you will need to add test users later.)

Now you will be on the **Edit app registration** page.

### Edit app registration

#### Config OAuth consent screen

- Follow the instructions to fill out the **OAuth consent screen** form.
- Click **SAVE AND CONTINUE** to continue.

#### Config scopes

- Click **ADD OR REMOVE SCOPES** and select `../auth/userinfo.email`, `../auth/userinfo.profile` and `openid` in the popup drawer, and click **UPDATE** to finish.
- Fill out the form as you need.
- Click **SAVE AND CONTINUE** to continue.

#### Add test users (External user type only)

- Click **ADD USERS** and add test users to allow these users to access your application while testing.
- Click **SAVE AND CONTINUE** to continue.

Now you should have the Google OAuth 2.0 consent screen configured.

## Obtain OAuth 2.0 credentials

- On the left **APIs & Services** menu, click the **Credentials** button.
- On the **Credentials** page, click the **+ CREATE CREDENTIALS** button on the top menu bar, and select **OAuth client ID**.
- On the **Create OAuth client ID** page, select **Web application** as the application type.
- Fill out the basic information for your application.
- Click **+ Add URI** to add an authorized domain to the **Authorized JavaScript origins** section. This is the domain that your logto authorization page will be served from. In our case, this will be `${your_logto_origin}`. e.g.`https://logto.dev`.
- Click **+ Add URI** in the ****Authorized redirect URIs**** section to set up the ****Authorized redirect URIs****, which redirect the user to the application after logging in. In our case, this will be `${your_logto_endpoint}/callback/google-universal`. e.g. `https://logto.dev/callback/google-universal`.
- Click **Create** to finish and then you will get the **Client ID** and **Client Secret**.

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |

## References
* [Google Identity: Setting up OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup)

# Google 连接器

## 在 Google API 控制台中创建一个项目

- 用你的 Google 帐号登录 [Google 云端平台](https://console.developers.google.com)。
- 点按顶部菜单栏上的「选择项目」，然后点击「新建项目」按钮，新建一个项目。
- 在新创建的项目中，点击「API 和服务」进入「API 和服务」的页面中。

## 配置 OAuth 同意屏幕

### 注册和配置应用

- 在左侧的「API 和服务」的菜单栏中, 点按「OAuth 同意屏幕」。
- 选择你所需要的「User Type」（用户类型），之后点击「创建」。（注意: 如果你将「User Type」（用户类型）设置为「外部」，在后续的步骤中你需要设置测试用户。）

现在你将位于「修改应用注册」页面。

### 修改应用注册

#### 设置「OAuth 同意屏幕」

- 根据页面提示，填写「OAuth 同意屏幕」相关表单。
- 点按「保存并继续」以进行后续操作。

#### 配置权限「范围」

- 点击「添加或移除范围」按钮，然后在弹出的抽屉页面中选择 `../auth/userinfo.email`、 `../auth/userinfo.profile` 和 `openid`，然后点击「更新」以完成配置。
- 根据你的需求填写页面上的相关的表单。
- 点按「保存并继续」以进行后续操作。

#### 添加「测试用户」（仅「User Type」（用户类型）设置为「外部」时需要）

- 点击 「+ ADD USERS」（添加用户）添加测试用户，以便这些用户能在应用的发布状态为”测试时“能访问该应用。
- 点按「保存并继续」以进行后续操作。

现在你已经配置好了 Google 的「OAuth 同意屏幕」。

## 获取 OAuth 2.0 凭据

- 在左侧「API 和服务」的菜单中，点按「凭据」选项。
- 在「凭据」页面内的上部菜单栏中，点击「+ 创建凭据」，然后选择「OAuth 客户端 ID」。
- 在「创建 OAuth 客户端 ID」页面内，将「应用类型」设置为「Web 应用」。
- 填写相关的应用基本信息。
- 在「已获授权的 JavaScript 来源」中，点击「+ 添加URI」，该 URI 值为你所部署的 Logto 服务的地址。此处这个值应为 `${your_logto_origin}`。例如：`https://logto.dev`。
- 在「已获授权的重定向 URI」中，点击「+ 添加URI」以添加「已获授权的重定向 URI」。「已获授权的重定向 URI」将在用户使用 Google 帐号成功登录 Logto 后将用户重定向回你的应用。此处这个值应为 `${your_logto_endpoint}/callback/google-universal`。例如：`https://logto.dev/callback/google-universal`。
- 点击「创建」后，你将获得「客户端 ID」（Client ID）和「客户端密钥」（Client Secret）。

### 配置类型

| 名称         | 类型   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |
## 参考
* [Google Identity: 设置 OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup)
