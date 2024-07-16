# Aliyun direct mail connector

The official Logto connector for Aliyun connector for direct mail service.

阿里云邮件推送服务 Logto 官方连接器 [中文文档](#阿里云邮件连接器)

**Table of contents**

- [Aliyun direct mail connector](#aliyun-direct-mail-connector)
  - [Get started](#get-started)
  - [Set up an email service in Aliyun DirectMail Console](#set-up-an-email-service-in-aliyun-directmail-console)
    - [Create an Aliyun account](#create-an-aliyun-account)
    - [Enable and configure Aliyun Direct Mail](#enable-and-configure-aliyun-direct-mail)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test Aliyun DM connector](#test-aliyun-dm-connector)
    - [Config types](#config-types)
- [阿里云邮件连接器](#阿里云邮件连接器)
  - [开始上手](#开始上手)
  - [在阿里云邮件服务控制台中配置一个邮件服务](#在阿里云邮件服务控制台中配置一个邮件服务)
    - [注册阿里云帐号](#注册阿里云帐号)
    - [启用并配置阿里云邮件服务](#启用并配置阿里云邮件服务)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [测试阿里云邮件连接器](#测试阿里云邮件连接器)
    - [配置类型](#配置类型)

## Get started

Aliyun is a primary cloud service provider in Asia, offering many cloud services, including DM (direct mail). Aliyun DM Connector is a plugin provided by the Logto team to call the Aliyun DM service APIs, with the help of which Logto end-users can register and sign in to their Logto account via mail verification code (or in other words, verification code).

## Set up an email service in Aliyun DirectMail Console

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an Aliyun account

Head to [Aliyun](https://aliyun.com/) and create your Aliyun account if you don't have one.

### Enable and configure Aliyun Direct Mail

Go to the [DM service console page](https://www.aliyun.com/product/directmail) and sign in. Enable the Direct Mail service by clicking the "Apply to enable" (申请开通) button on the top left of the page and begin the configuration process.

Starting from the [DM admin console page](https://dm.console.aliyun.com/), you should:
1. Go to "Email Domains" (发信域名) from the sidebar and add "New Domain" (新建域名) following the instructions.
2. Customize "Sender Addresses" (发信地址) and "Email Tags" (邮件标签) respectively.

After finishing setup, there are two different ways to test:
- Go to the [DirectMail Overview page](https://dm.console.aliyun.com/), find "Operation Guide" (操作引导) at the bottom of the page, and click on "Send Emails" (发送邮件). You will find all the different kinds of testing methods.
- Follow the path "Send Emails" (发送邮件) -> "Email Tasks" (发送邮件) in the sidebar to create a testing task.

## Compose the connector JSON

1. From the [DM admin console page](https://dm.console.aliyun.com/), hover on your avatar in the top right corner and go to "AccessKey Management" (AccessKey 管理), and click "Create AccessKey" (创建 AccessKey). You will get an "AccessKey ID" and "AccessKey Secret" pair after finishing security verification. Please keep them properly.
2. Go to the "Sender Addresses" (发信地址) or "Email Tags" (邮件标签) tab you just visited from the [DM admin console page](https://dm.console.aliyun.com/), you can find _Sender Address_ or _Email Tag_ easily.
3. Fill out the Aliyun DM Connector settings:
    - Fill out the `accessKeyId` and `accessKeySecret` fields with access key pairs you've got from step 1.
    - Fill out the `accountName` and `fromAlias` field with "Sender Address" and "Email Tag" which were found in step 2. All templates will share this signature name. (You can leave `fromAlias` blank as it is OPTIONAL.)
    - You can add multiple DM connector templates for different cases. Here is an example of adding a single template:
        - Fill out the `subject` field, which will work as title of the sending email.
        - Fill out the `content` field with arbitrary string-type contents. Do not forget to leave `{{code}}` placeholder for random verification code.
        - Fill out `usageType` field with either `Register`, `SignIn`, `ForgotPassword` or `Generic` for different use cases. (`usageType` is a Logto property to identify the proper use case.) In order to enable full user flows, templates with usageType `Register`, `SignIn`, `ForgotPassword` and `Generic` are required.

### Test Aliyun DM connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/).

### Config types

| Name            | Type              |
|-----------------|-------------------|
| accessKeyId     | string            |
| accessKeySecret | string            |
| accountName     | string            |
| fromAlias       | string (OPTIONAL) |
| templates       | Template[]        |

| Template Properties | Type        | Enum values                                          |
|---------------------|-------------|------------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

# 阿里云邮件连接器

## 开始上手

阿里云是亚洲地区一个重要的云服务厂商，提供了包括邮件服务在内的诸多云服务。

本连接器是 Logto 官方提供的阿里云邮件连接器，帮助终端用户通过邮件验证码进行登录注册。

## 在阿里云邮件服务控制台中配置一个邮件服务

> 💡 **Tip**
> 
> 你可以跳过已经完成的部分。

### 注册阿里云帐号

前往 [阿里云](https://aliyun.com/) 并完成帐号的注册。

### 启用并配置阿里云邮件服务

来到 [阿里云邮件服务](https://www.aliyun.com/product/directmail) 然后登录。点按页面左上的「申请开通」按钮以开通邮件服务并开始配置流程。

从 [邮件服务管理控制台](https://dm.console.aliyun.com/) 开始：
1. 从侧边栏进入到「发信域名」，点按「新建域名」并完成指引。
2. 依次配置好「发信地址」和「邮件标签」。

在完成了设置之后，这里提供了两种测试的方法：
- 前往 [邮件服务管理控制台概览](https://dm.console.aliyun.com/)，在该页面底部找到「操作引导」框并点按「发送邮件」。你可以找到很多不同的测试方法。
- 在侧边栏中选择「发送邮件」->「发送邮件」，在这里你可以「新建发送任务」来测试。

## 编写连接器的 JSON

1. 在 [邮件服务管理控制台](https://dm.console.aliyun.com/)，鼠标停在右上角你的头像上，进入「AccessKey 管理」，点按「创建 AccessKey」。完成了安全验证之后，你会得到一对「AccessKey ID」和「AccessKey Secret」，请妥善保管他们。
2. 从 [邮件服务管理控制台](https://dm.console.aliyun.com/) 的侧边栏，分别进入「发信地址」和「邮件标签」。这里你可以找到之前创建的 _发信地址_ 和 _邮件标签_。
3. 完成阿里云邮件服务连接器的设置：
    - 用你在步骤 1 中拿到的一对「AccessKey ID」和「AccessKey Secret」来分别填入 `accessKeyId` 和 `accessKeySecret`。
    - 用步骤 2 中的 _发信地址_ 和 _邮件标签_ 填写 `accountName` 和 `fromAlias`。（`fromAlias` 可以不填写，它是 **可选的**。）
    - 你可以添加多个邮件服务模板以应对不同的用户场景。这里展示填写单个模板的例子：
      - 在 `subject` 栏填写发送邮件的 _标题_。
      - 在 `content` 栏中填写字符形式的内容。不要忘了在内容中插入 `{{code}}` 占位符，在真实发送时他会被替换成随机生成的验证码。
      - `usageType` 栏填写 `Register`，`SignIn`，`ForgotPassword` 或者`Generic` 其中之一以分别对应 _注册_，_登录_，_忘记密码_ 和 _通用_ 的不同场景。（`usageType` 是 Logto 的属性，用来确定使用场景。）为了能够使用完成的流程，需要配置 `usageType` 为 `Register`，`SignIn`, `ForgotPassword` 以及 `Generic` 的模板。

### 测试阿里云邮件连接器

你可以在「保存并完成」之前输入一个邮件地址并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用邮件验证码登录](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/) 吧。

### 配置类型

| 名称            | 类型              |
|-----------------|-------------------|
| accessKeyId     | string            |
| accessKeySecret | string            |
| accountName     | string            |
| fromAlias       | string (OPTIONAL) |
| templates       | Template[]        |

| 模板属性   | 类型        | 枚举值                                                 |
|-----------|-------------|------------------------------------------------------|
| subject   | string      | N/A                                                  |
| content   | string      | N/A                                                  |
| usageType | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
