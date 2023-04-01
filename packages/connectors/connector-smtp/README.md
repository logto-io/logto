# SMTP connector

The official Logto connector for SMTP.

SMTP Logto 官方连接器 [中文文档](#smtp-连接器)

**Table of contents**

- [SMTP connector](#smtp-connector)
  - [Get started](#get-started)
  - [Set up SMTP connector](#set-up-smtp-connector)
    - [Set up for Gmail use](#set-up-for-gmail-use)
    - [Integrate with SendGrid SMTP API](#integrate-with-sendgrid-smtp-api)
    - [Configure with Aliyun direct mail account](#configure-with-aliyun-direct-mail-account)
    - [Test SMTP connector](#test-smtp-connector)
    - [Config types](#config-types)
  - [References](#references)
- [SMTP 连接器](#smtp-连接器)
  - [开始上手](#开始上手)
  - [设置 SMTP 连接器](#设置-smtp-连接器)
    - [SMTP 连接器对接 Gmail 的配置](#smtp-连接器对接-gmail-的配置)
    - [集成 SendGrid SMTP API](#集成-sendgrid-smtp-api)
    - [针对阿里云邮件帐号的配置](#针对阿里云邮件帐号的配置)
    - [测试 SMTP 连接器](#测试-smtp-连接器)
    - [配置类型](#配置类型)
  - [参考](#参考)

## Get started

The SMTP (Simple Mail Transfer Protocol) is an internet standard communication protocol for electronic mail transmission. Mail servers and other message transfer agents use SMTP to send and receive messages.

## Set up SMTP connector

SMTP is a transmission protocol that is not exclusive to some specific email service providers but can work with all providers.

We are now offering guides on how to use the SMTP connector to send emails following providers for your better understanding:
- _Gmail_ is the most popular email service vendor worldwide.
- _Aliyun direct mail_ and _SendGrid mail_. Some of you might be familiar with these two email service providers because Logto Team provided corresponding connectors; you will likely have a general idea of them.

We hope you can figure out all other email vendors' setups with the following examples :rocket:

### Set up for Gmail use

You can get a new Gmail account at [Gmail](https://mail.google.com/), or you can use an existing account if you have one.

A [Gmail official post](https://support.google.com/a/answer/176600) shows how to determine required properties' values to operate Gmail via an SMTP connector.

### Integrate with SendGrid SMTP API

Initially, we assume that you already have a SendGrid account. If not, create a new account at the [SendGrid website](https://app.sendgrid.com/).

You can find a step-by-step guide on ["Integrating with the SMTP API"](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api).

Developers can access _sender_ details on the ["Sender Management"](https://mc.sendgrid.com/senders).

### Configure with Aliyun direct mail account

Sign in to the [Aliyun website](https://cn.aliyun.com/). Register a new account if you don't have one.

Follow the [Send emails using SMTP guide](https://www.alibabacloud.com/help/en/directmail/latest/send-emails-using-smtp) and finish those 'tasks' to get those required settings and information.

You can go to [SMTP service address page](https://www.alibabacloud.com/help/en/directmail/latest/smtp-service-address) to choose a proper SMTP service address host and port number.

To check "Sender Addresses", you can find the entrance on the left-side navigation pane on [DirectMail console](https://dm.console.aliyun.com/). You should see `Sender address` and `SMTP Password` here.

> ℹ️ **Note**
>
> Only one sample template is provided in the previous cases to keep things simple. You should add more templates for other use cases.
> You should change values wrapped with "<" and ">" according to your Gmail, SendGrid or Aliyun account settings and choose to keep other fields w/o "<" and ">".
> Add `{{code}}` as a placeholder in templates' content to show random verification code in sending emails.

### Test SMTP connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-passcode-sign-in/#enable-connector-in-sign-in-experience).

### Config types

| Name      | Type       |
|-----------|------------|
| host      | string     |
| port      | string     |
| fromEmail | string     |
| templates | Template[] |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| contentType         | enum string | 'text/plain' \| 'text/html'                          |

**Username and password Auth Options**

| Name | Type                   | Enum values |
|------|------------------------|-------------|
| user | string                 | N/A         |
| pass | string                 | N/A         |
| type | enum string (OPTIONAL) | 'login'     |

You can also configure [OAuth2 Auth Options](https://nodemailer.com/smtp/oauth2/) and other advanced configurations. See [here](https://nodemailer.com/smtp/) for more details.

We gave an example config with all configurable parameters in the text box to help you to set up own configuration. (You are responsible to the configuration, some values are for demonstration purpose and may not fit your use case.)

## References

- [Gmail - Send email from a printer, scanner, or app](https://support.google.com/a/answer/176600)
- [SendGrid - Integrating with the SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Aliyun Direct Mail - Send emails using SMTP](https://www.alibabacloud.com/help/en/directmail/latest/send-emails-using-smtp)
- [Aliyun Direct Mail - SMTP Reference](https://www.alibabacloud.com/help/en/directmail/latest/smtp-reference)
- [Nodemailer - SMTP Transport](https://nodemailer.com/smtp/)

# SMTP 连接器

## 开始上手

SMTP（简单邮件传输协议）是一种在网络中传输电子邮件的标准通信协议。邮件服务器和其他信息传输代理用 SMTP 来收发邮件。

## 设置 SMTP 连接器

SMTP 是一个所有邮件服务提供商通用的传输协议。

我们提供了 SMTP 连接器用于以下几种邮件服务提供商的使用指南，帮助你有更好的理解：

- _Gmail_ 是世界上最受欢迎的邮件服务商
- _阿里云邮件_ 和 _SendGrid_（Logto 提供了对接这两个服务商的连接器，因此你们也许会对这两个服务商比较熟悉并有一个基本概念）

希望在浏览了以下几个案例之后，你能够处理大部分其他邮件服务的配置 :rocket:

### SMTP 连接器对接 Gmail 的配置

你可以使用已有的 Gmail 邮箱或者通过 [Gmail](https://mail.google.com/) 创建一个新的账号。

前往这篇 [Gmail 官方帮助文档](https://support.google.com/a/answer/176600)，查看如何得到 SMTP 连接器调用 Gmail 服务所 **必须的** 属性。

### 集成 SendGrid SMTP API

我们假设你已经有了 SendGrid 账号，否则就在 [SendGrid](https://app.sendgrid.com/) 创建新账号。

在 [集成 SendGrid SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api) 可以找到详尽的集成指南。

开发者可以前往 [_Sender Management_](https://mc.sendgrid.com/senders) 以访问相应的 _sender_ 详情。

### 针对阿里云邮件帐号的配置

登录 [阿里云](https://cn.aliyun.com/) 并创建新账号。

跟随 [使用 SMTP 发送邮件](https://www.alibabacloud.com/help/zh/directmail/latest/send-emails-using-smtp)，完成里面的各个步骤以获取需要的配置和信息。

前往 [SMTP 服务地址](https://www.alibabacloud.com/help/zh/directmail/latest/smtp-service-address) 并选择合适的 SMTP 服务地址与端口号。

在 [阿里云工作台](https://dm.console.aliyun.com/) 侧边栏中找到「发信地址」，在这里你可以找到 `Sender address` 和 `SMTP Password`。

> ℹ️ **注意**
>
> 简单起见，前面提及的所有例子都只给出了一个模板样例。如果要满足其他更多场景的使用，你需要自己添加更多模板。
> 用尖括号 "<" 和 ">" 包起来的值需要根据 Google，SendGrid 或阿里云账号来重新填写，其他的设置可以按需进行调整。
> 在模板的内容中加上 `{{code}}` 的占位符以在所发送邮件正文的相同位置插入随机验证码。

### 测试 SMTP 连接器

你可以在「保存并完成」之前输入一个手机号码并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用短信或邮件验证码登录](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-passcode-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8) 吧。

### 配置类型

| 名称      | 类型        |
|-----------|------------|
| host      | string     |
| port      | string     |
| fromEmail | string     |
| templates | Template[] |

| 模板属性     | 类型         | 枚举值                                                |
|-------------|-------------|------------------------------------------------------|
| subject     | string      | N/A                                                  |
| content     | string      | N/A                                                  |
| usageType   | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
| contentType | enum string | 'text/plain' \| 'text/html'                          |

**用户名密码的授权配置**

| 模板属性  | 类型                    | 枚举值   |
|----------|------------------------|---------|
| user     | string                 | N/A     |
| pass     | string                 | N/A     |
| type     | enum string (OPTIONAL) | 'login' |

你也可以使用 [OAuth2 授权配置](https://nodemailer.com/smtp/oauth2/) 和其他高级的 SMTP 配置。点按 [这里](https://nodemailer.com/smtp/) 了解更多.

我们在文本输入框预填的配置样例里预填了所有可配置的参数，以便你可以用来参考并建立自己的配置。（你需要对自己的配置负责，样例配置中展示的一些值是为了示意，可能并不适用你的用户场景。）

## 参考

- [Gmail - 从打印机、扫描仪或应用发送电子邮件](https://support.google.com/a/answer/176600?hl=zh-Hans)
- [SendGrid - Integrating with the SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [阿里云邮件推送 - 使用 SMTP 发送邮件](https://www.alibabacloud.com/help/zh/directmail/latest/send-emails-using-smtp)
- [阿里云邮件推送 - SMTP 参考](https://www.alibabacloud.com/help/zh/directmail/latest/smtp-reference)
- [Nodemailer - SMTP Transport](https://nodemailer.com/smtp/)
