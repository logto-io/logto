# Alipay Web

The official Logto connector for Alipay social sign-in in web apps.

支付宝 web 应用社交登录官方 Logto 连接器 [中文文档](#支付宝网页连接器)

**Table of contents**

- [Alipay Web](#alipay-web)
  - [Get started](#get-started)
  - [Register Alipay developer account](#register-alipay-developer-account)
  - [Create and configure Alipay app](#create-and-configure-alipay-app)
  - [Set up the Logto Alipay Web connector settings](#set-up-the-logto-alipay-web-connector-settings)
    - [Config types](#config-types)
  - [Test Alipay web connector](#test-alipay-web-connector)
  - [References](#references)
- [支付宝网页连接器](#支付宝网页连接器)
  - [开始上手](#开始上手)
  - [注册支付宝开发者账号](#注册支付宝开发者账号)
  - [在支付宝开放平台上创建并且配置应用](#在支付宝开放平台上创建并且配置应用)
  - [设置支付宝网页连接器](#设置支付宝网页连接器)
    - [配置类型](#配置类型)
  - [测试支付宝网页连接器](#测试支付宝网页连接器)
  - [参考](#参考)

## Get started

Alipay Web connector is designed for desktop Web applications. It takes advantage of Alipay's OAuth 2.0 authentication workflow and enables Alipay users to sign in to other Apps using public Alipay user profiles without going through a troublesome register process.

## Register Alipay developer account

[Register an Alipay developer account](https://certifyweb.alipay.com/certify/reg/guide#/) if you don't have one.

## Create and configure Alipay app

1. Sign in to the [Alipay console](https://open.alipay.com/) with the account you have just registered.
2. Go to "Web & Mobile Apps" (网页&移动应用) tab in "My Application" (我的应用) panel.
3. Click "Create an App" (立即创建) button to start configuring your application.
4. Name your application in "Application Name" (应用名称) following the naming conventions and upload your "Application Icon" (应用图标), make sure you choose "web application" (网页应用) as "App type" (应用类型).
5. After finishing creating the application, we come to the Overview page, where we should click "add ability" (添加能力) to add "Third-party application authorization" (第三方应用授权), "Get member information" (获取会员信息) and "App Alipay login" (App 支付宝登录) before enabling Alipay sign-in.
6. Go to [Alipay Customer Center](https://b.alipay.com/index2.htm), and sign in with the Alipay developer account. Click "Account Center" (账号中心) on the topbar and go to "APPID binding" (APPID 绑定), whose entrance can be found at the bottom of the sidebar. "Add binding" (添加绑定) by type in the APPID of the web application you just created in step 4.
7. Click on "Sign" button of "App Alipay login", and finish signing process following the guide. After finishing this step, you are expected to find abilities you have just added in step 5 kicks in.
8. Come back to Alipay open platform console page, and you can find "Interface signing method" (接口加签方式（密钥/证书）) in "development information" (开发信息) section. Click "set up" (设置) button, and you can find yourself on a page setting signing method. "Public Key" (公钥) is the preferred signing mode, and fill in contents from the public key file you have generated in the text input box.
9. Set up "Authorization Redirect URI" (授权回调地址) by clicking "set up" (设置) button on the bottom of the Alipay console page. `${your_logto_origin}/callback/${connector_id}` is the default redirect URI used in Logto core. The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.
10. After finishing all these steps, go back to the top right corner of Alipay console page, and click "Submit for review" (提交审核). Once the review is approved, you are good to go with a smooth Alipay sign-in flow.

> ℹ️ **Note**
> 
> You can use _openssl_ to generate key pairs on your local machine by executing following code snippet in terminal.
> 
> ```bash
> openssl genrsa -out private.pem 2048
> openssl rsa -in private.pem -outform PEM -pubout -out public.pem
> ```
> 
> When filling in the public key on the Alipay app setup website, you need to remove the header and footer of `public.pem`, delete all newline characters, and paste the rest of the contents into the text input box for "public key".

## Set up the Logto Alipay Web connector settings

1. In [the Alipay console workspace](https://open.alipay.com/dev/workspace) go to "My application" (我的应用) panel and click "Web & Mobile Apps" (网页&移动应用) tab, you can find APPID of all applications.
2. In step 7 of the previous part, you have already generated a key pair including a private key and a public key.
3. Fill out the Logto connector settings:
    - Fill out the `appId` field with APPID you've got from step 1.
    - Fill out the `privateKey` field with contents from the private key file mentioned in step 2. Please MAKE SURE to use '\n' to replace all newline characters and do not remove header and footer in private key file.
    - Fill out the `signType` field with 'RSA2' due to the `Public key` signing mode we chose in step 7 of "Create And Configure Alipay Apps".
    - Fill out the `charset` field with either 'gbk' or 'utf8'. You can leave this field blank as it is OPTIONAL. The default value is set to be 'utf8'.
    - Fill out the `scope` field with either 'auth_base' or 'auth_user'. You can leave this field blank as it is OPTIONAL. The default value is set to be 'auth_user'. You can check out the [difference](https://opendocs.alipay.com/fw/api/105942) between different values.

### Config types

| Name       | Type                   | Enum values                  |
|------------|------------------------|------------------------------|
| appId      | string                 | N/A                          |
| privateKey | string                 | N/A                          |
| signType   | enum string            | 'RSA' \| 'RSA2'              |
| charset    | enum string (OPTIONAL) | 'gbk' \| 'utf8' \| undefined |
| scope      | enum string (OPTIONAL) | 'auth_user' \| 'auth_base'   |

## Test Alipay web connector

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/).

Once Alipay web connector is enabled, you can build and run your web app to see if it works.

## References

- [Alipay Docs - Access Preparation - How to create an app](https://opendocs.alipay.com/support/01rau6)
- [Alipay Docs - Web & Mobile Apps - Create an app](https://opendocs.alipay.com/open/200/105310)

# 支付宝网页连接器

## 开始上手

支付宝网页连接器是为桌面网页应用设计的。它采用了支付宝的 OAuth 2.0 认证流程，并使支付宝用户可以使用公开的支付宝用户信息登录其他应用，而不需要进行令人困惑的注册过程。

## 注册支付宝开发者账号

如果你还没有支付宝开发者账号，参考链接：[注册一个支付宝开发者账号](https://certifyweb.alipay.com/certify/reg/guide#/)

## 在支付宝开放平台上创建并且配置应用

1. 使用你所创建的支付宝开发者账号登录 [支付宝开放平台控制台](https://open.alipay.com/)。
2. 在「我的应用」中选择「网页&移动应用」标签页。
3. 点击「立即创建」开始创建并且配置你的应用
4. 根据平台的命名规则通过「应用名称」字段给你的应用命名；在「应用图标」中上传应用图标；将「应用类型」设定为「网页应用」。
5. 当应用创建成功后，我们进入到了「概览」页面，接下来我们在「能力列表」中点击「+ 添加能力」，将「App 支付宝登录」、「获取会员信息」、「第三方应用授权」添加到能力列表中。
6. 使用开发者账号登录 [支付宝商家中心](https://b.alipay.com/index2.htm) 后，从顶栏菜单的进入「账号中心」，然后选择从左侧的菜单栏底部进入「APPID 绑定」页面。点击「+ 添加绑定」，之后输入你在步骤 4 中所创建的应用的 APPID。
7. 点按「App 支付宝登录」旁边「签约」按钮，并按照提示完成签约。当此步骤完成后，步骤 5 中所添加的各种「能力」即可生效。
8. 回到「支付宝开放平台控制台」中第 5 步所创建的应用的「概览」页面, 在该页面的「开发信息」中点击「接口加签方式（密钥/证书）」的「设置」链接，将「选择加签模式」设定为「公钥」,然后将你生成的公钥填入下方「填写公钥字符」的文本编辑框中。
9. 点击「授权回调地址」的「设置链接」，选择你所需要的「回调地址类型」，将 Logto Core 默认使用的 `${your_logto_origin}/callback/${connector_id}` 设置为「回调地址」。`connector_id` 在管理控制台相应连接器的详情页的顶栏中可以找到。
10. 当设置完以上的所有步骤，点击「概览」页面上方的「提交审核」，当审核通过后，你将可以顺利地使用支付宝登录自己的网页应用。

> ℹ️ **注意**
> 
> 你可以用 _openssl_ 来在本地机器上，用下面这一段代码在终端里生成一个密钥对。
> 
> ```bash
> openssl genrsa -out private.pem 2048
> openssl rsa -in private.pem -outform PEM -pubout -out public.pem
> ```
> 
> 在支付宝应用设置网页上填写公钥时，需要把生成的 `public.pem` 文件中内容的文件头和文件尾去掉，同时删除所有的换行符，再把剩下的内容粘贴到填写公钥的文本框中。

## 设置支付宝网页连接器

1. 在 [支付宝开放平台控制台](https://open.alipay.com/dev/workspace) 中，点击「我的应用」面板中的「网页&移动应用」，获取应用的 APPID。
2. 获取你在上一部分的第 7 个步骤中生成的密钥对。
3. 配置你的应用的支付宝网页连接器:
    - 将你在第 1 步中获取的 APPID 填入 `appId` 字段。
    - 将你在第 2 步中获得的密钥对的私钥填入 `privateKey` 字段。请保留私钥文件内容中的文件头和文件尾，并 **确保** 使用 '\n' 替换了所有换行符。
    - 将你在第 2 步中所获得的密钥的签名模式 'RSA2' 填入 `signType` 字段。
    - 在 `charset` 字段中填入 'gbk' 或 'utf8' 字符串。这个字段也可以选择不填，此时我们会使用 'utf8' 的默认值。
    - 在 `scope` 字段中填入 'auth_user' 或者 'auth_base'。这个字段也可以选择不填，此时我们会使用 'auth_user' 的默认值。你可以在[这里](https://opendocs.alipay.com/fw/api/105942)查看更多关于这两个值的信息。

### 配置类型

| 名称       | 类型                    | 枚举值                        |
|------------|------------------------|------------------------------|
| appId      | string                 | N/A                          |
| privateKey | string                 | N/A                          |
| signType   | enum string            | 'RSA' \| 'RSA2'              |
| charset    | enum string (OPTIONAL) | 'gbk' \| 'utf8' \| undefined |
| scope      | enum string (OPTIONAL) | 'auth_user' \| 'auth_base'   |

## 测试支付宝网页连接器

大功告成。别忘了 [在登录体验中启用社交登录](https://docs.logto.io/docs/recipes/configure-connectors/social-connector/enable-social-sign-in/)。

在支付宝网页连接器启用后，你可以构建并运行你的网页应用看看是否生效。

## 参考

- [支付宝文档中心 - 接入准备 - 如何创建应用](https://opendocs.alipay.com/support/01rau6)
- [支付宝文档中心 - 网页&移动应用 - 创建应用](https://opendocs.alipay.com/open/200/105310)
