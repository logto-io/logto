# WeChat web connector

The official Logto connector for WeChat social sign-in in web apps.

微信 web 应用社交登录官方 Logto 连接器 [中文文档](#微信网页连接器)

**Table of contents**

- [WeChat web connector](#wechat-web-connector)
  - [Get started](#get-started)
  - [Create a web app in the WeChat Open Platform](#create-a-web-app-in-the-wechat-open-platform)
    - [Create an account](#create-an-account)
    - [Create a web app](#create-a-web-app)
      - [Basic info](#basic-info)
      - [Website info](#website-info)
      - [Waiting for the review result](#waiting-for-the-review-result)
    - [Configure your WeChat connector](#configure-your-wechat-connector)
    - [Test WeChat web connector](#test-wechat-web-connector)
- [微信网页连接器](#微信网页连接器)
  - [开始上手](#开始上手)
  - [在微信开放平台新建一个网页应用](#在微信开放平台新建一个网页应用)
    - [创建一个账号](#创建一个账号)
    - [创建一个网页应用](#创建一个网页应用)
      - [基础信息](#基础信息)
      - [网站信息](#网站信息)
      - [等待审核结果](#等待审核结果)
    - [配置微信网页连接器](#配置微信网页连接器)
    - [测试微信网页连接器](#测试微信网页连接器)

## Get started

If you don't know the concept of the connector or don't know how to add this connector to your Sign-in experience, please see [Logto tutorial](https://docs.logto.io/docs/tutorials/get-started/enable-social-sign-in).

> **⚠️ Caution**
> 
> This connector is for web apps only. If you are looking for the method for signing in with WeChat in native apps, please see [WeChat native connector](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-wechat-native).

## Create a web app in the WeChat Open Platform

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an account

Open https://open.weixin.qq.com/, click the "Sign Up" button in the upper-right corner, then finish the sign-up process.

### Create a web app

Sign in with the account you just created. In the "Web Application" (网页应用) tab, click the big green button "Create a web app" (创建网页应用).

![App tabs](/packages/connectors/connector-wechat-web/docs/app-tabs.png)

Let's fill out the required info in the application form.

![Create a web app](/packages/connectors/connector-wechat-web/docs/create-web-app.png)

#### Basic info

Most of them are pretty straightforward. After finishing the form, click "Next step" to move on.

#### Website info

Fill "Authorization callback domain" (授权回调域) with your Logto domain. E.g., `logto.io`.

#### Waiting for the review result

After completing the website info, click "Submit Review" to continue. Usually, the review goes fast, which will end within 1-2 days.

We suspect the reviewer is allocated randomly on each submission since the standard is floating. You may get rejected the first time, but don't give up! State your status quo and ask the reviewer how to modify it.

### Configure your WeChat connector

Fill out the `clientId` and `clientSecret` field with _Client ID_ and _Client Secret_ you've got from OAuth app detail pages.

Fill out the `scope` field with either 'snsapi_userinfo' or 'snsapi_base'. You can leave this field blank as it is OPTIONAL. The default value is set to be 'snsapi_userinfo'. You can check out the [difference](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html) between different values.

### Test WeChat web connector

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-social-sign-in).

Once WeChat web connector is enabled, you can sign in to your app again to see if it works.

# 微信网页连接器

## 开始上手

如果你还不知道连接器的概念，或者还不知道如何将本连接器添加至你的「登录体验」，请先参见 [Logto 教程](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-social-sign-in)。

> **⚠️ Caution**
> 
> 这个连接器只适用于网页应用。如果你在寻找移动端原生应用的微信登录解决方案，请移步 [微信原生连接器](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-wechat-native)。

## 在微信开放平台新建一个网页应用

> 💡 **Tip**
> 
> 你可以跳过已经完成的部分。

### 创建一个账号

打开 [https://open.weixin.qq.com/](https://open.weixin.qq.com/)，点按右上角的「注册」按钮，根据引导完成注册流程。

### 创建一个网页应用

用刚创建的帐号登录。在「移动应用」标签页，点按大而绿的「创建移动应用」按钮。

![App tabs](/packages/connectors/connector-wechat/docs/app-tabs.png)

让我们填写一下申请表单里的必要信息。

![Create a web app](/packages/connectors/connector-wechat/docs/create-web-app.png)

#### 基础信息

大多数字段都很直接。在完成了表格之后，点按「下一步」以继续。

#### 网站信息

用你的 Logto 域名（例如 `logto.io`）填写「授权回调域」。

#### 等待审核结果

完成输入网站信息之后，点按「提交审核」以继续。审核速度通常很快，1-2 天即可完成。

我们怀疑每次提交审核者都是随机分配的，因为审核标准飘忽不定。第一次提交也许会被拒绝，但别灰心！陈述你的现状并询问审核者如何修改。

### 配置微信网页连接器

分别用 OAuth 应用详情页面中的 _Client ID_ 和 _Client Secret_ 填写 `clientId` 和 `clientSecret` 字段。

在 `scope` 字段中填入 'snsapi_userinfo' 或者 'snsapi_base'。这个字段也可以选择不填，此时我们会使用 'snsapi_userinfo' 的默认值。你可以在[这里](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)查看更多关于这两个值的信息。

### 测试微信网页连接器

大功告成。别忘了 [在登录体验中启用本连接器](https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-social-sign-in)。

在微信原生连接器启用后，你可以构建并运行你的应用看看是否生效。
