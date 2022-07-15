# Aliyun short message service connector

The official Logto connector for Aliyun short message service.

阿里云短信服务 Logto 官方连接器 [中文文档](#阿里云短信连接器)

**Table of contents**

- [Aliyun short message service connector](#aliyun-short-message-service-connector)
  - [Get started](#get-started)
  - [Set up a short message service in Aliyun SMS Console](#set-up-a-short-message-service-in-aliyun-sms-console)
    - [Create an Aliyun account](#create-an-aliyun-account)
    - [Enable and Configure Aliyun Short Message Service](#enable-and-configure-aliyun-short-message-service)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test Aliyun SMS connector](#test-aliyun-sms-connector)
    - [Config types](#config-types)
  - [References](#references)
- [阿里云短信连接器](#阿里云短信连接器)
  - [在阿里云短信服务控制台中配置一个短信服务](#在阿里云短信服务控制台中配置一个短信服务)
    - [创建阿里云账号](#创建阿里云账号)
    - [启用并配置阿里云短信服务](#启用并配置阿里云短信服务)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [测试阿里云短信连接器](#测试阿里云短信连接器)
    - [配置类型](#配置类型)
  - [参考](#参考)

## Get started

Aliyun is a primary cloud service provider in Asia, offering many cloud services, including SMS (short message service). Aliyun SMS Connector is a plugin provided by the Logto team to call the Aliyun SMS service, with the help of which Logto end-users can register and sign in to their Logto account via SMS verification code (or in other words, passcode).

## Set up a short message service in Aliyun SMS Console

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Create an Aliyun account

Go to the [Aliyun website](https://cn.aliyun.com/) and register your Aliyun account if you don't have one.

### Enable and Configure Aliyun Short Message Service

1. Sign-in with your Aliyun account at the [Aliyun website](https://cn.aliyun.com/) and go to the [SMS service console page](https://www.aliyun.com/product/sms).
2. Click the "Open for free" (免费开通) button on the top left of the SMS service page and begin the configuration process.
3. Read and agree to the "SMS service activation Agreement" (短信服务开通条款) and click "Subscribe to a service" (开通服务) to move on.
4. You are now on the [SMS service console page](https://dysms.console.aliyun.com/overview), go to either "Mainland China" (国内消息) or "Outside Mainland China" (国际/港澳台消息) button on the sidebar per your use case.
5. Add signature and template following the guidelines, and provide the materials or information required for review.
    - Remember to select "Verification Code Message" (验证码) as "Scenario" (适用场景) when filling out the signature application and also "Verification Code Message" (验证码) for "Type" (模板类型) when applying for a template review because we are using these signatures and templates to send passcode. Currently, we do not support sending SMS messages other than verification-code-related text messages.
    - Also, use `{{code}}` as a placeholder where you want to place your digital passcode in template contents.
6. After submitting your SMS signature and template application, you need to wait for it to take effect. At this point, we can go back to the [SMS service console page](https://dysms.console.aliyun.com/overview) and send a test SMS. If your signatures and templates are ready for use, you can try them directly; if they are not taking effect yet, Aliyun also provides test templates.
    - You may need to recharge a small amount of money before sending test messages.
    - You may also be asked to bind a test phone number before sending test messages. For more details, go to "Quick Start" (快速学习) tab from the sidebar of the [SMS service console page](https://dysms.console.aliyun.com/overview).

## Compose the connector JSON

1. From the [SMS service console page](https://dysms.console.aliyun.com/overview), hover on your avatar in the top right corner and go to "AccessKey Management" (AccessKey 管理), and click "Create AccessKey" (创建 AccessKey). You will get an "AccessKey ID" and "AccessKey Secret" pair after finishing security verification. Please keep them properly.
2. Go to the "Mainland China" (国内消息) or "Outside Mainland China" (国际/港澳台消息) tab you just visited, you can find "Signature" (签名名称) and "Template Code" (模板 CODE) easily.
   - If you want to use the test-only signature and template, go to the "Quick Start" (快速学习) tab instead, and you will find them below "Signature & Templates (For Test Only)".
3. Fill out the Aliyun SMS Connector settings:
    - Fill out the `accessKeyId` and `accessKeySecret` fields with access key pairs you've got from step 1.
    - Fill out the `signName` field with "Signature" (签名名称) which is mentioned in step 2. All templates will share this signature name.
    - You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:
        - Fill the `templateCode` field, which is how you can control SMS context, with "Template Code" (模板 CODE) from step 2.
        - Fill out `usageType` field with either `Register`, `SignIn` or `Test` for different use cases. (`usageType` is a Logto property to identify the proper use case.)

Here is an example of Aliyun SMS connector config JSON.

```json
{
    "accessKeyId": "<your-access-key-id>",
    "accessKeySecret": "<your-access-key-secret>",
    "signName": "<Aliyun>",
    "templates": [
        {
            "templateCode": "<SMS_123456>",
            "usageType": "Register"
        },
        {
            "templateCode": "<SMS_234567>",
            "usageType": "SignIn"
        },
        {
            "templateCode": "<SMS_345678>",
            "usageType": "Test"
        },
    ]
}
```

### Test Aliyun SMS connector

You can type in a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-passcode-sign-in/#enable-connector-in-sign-in-experience).

### Config types

| Name            | Type       |
|-----------------|------------|
| accessKeyId     | string     |
| accessKeySecret | string     |
| signName        | string     |
| templates       | Template[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| templateCode        | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |


## References

- [Aliyun SMS - Quick Start](https://dysms.console.aliyun.com/quickstart)

# 阿里云短信连接器

阿里云是亚洲地区一个重要的云服务厂商，提供了包括短信服务在内的诸多云服务。

本连接器是 Logto 官方提供的阿里云短信连接器，帮助终端用户通过短信验证码进行登录注册。

## 在阿里云短信服务控制台中配置一个短信服务

> 💡 **Tip**
> 
> 你可以跳过已经完成的部分。

### 创建阿里云账号

前往 [阿里云](https://cn.aliyun.com/) 并完成账号注册。

### 启用并配置阿里云短信服务

1. 用刚刚在 [阿里云](https://cn.aliyun.com/) 注册额账号登录并前往 [短信服务控制台](https://www.aliyun.com/product/sms)。
2. 点按短信服务页面左上角的「免费开通」按钮并开始配置的流程。
3. 阅读并同意「短信服务开通条款」和「开通服务」以继续。
4. 你现在处于「[短信服务控制台概览](https://dysms.console.aliyun.com/overview)」，根据你的用户场景，点击侧边栏中的「国内消息」或者「国际/港澳台消息」。
5. 跟随指引添加签名和模板，并提供相应的材料和信息以便审核：
    - 注意：添加 **签名** 时要在「适用场景」栏选择「验证码」，添加 **模板** 时「模板类型」也要选择「验证码」，因为我们的使用这些签名和模板就是用来发送验证码的。目前我们暂不支持除了发送验证码之外别的类型的文字短信。
    - 请同时注意要在模板的内容中加上 `{{code}}` 的占位符，在发送短信是会被随机生成的验证码所替代。
6. 提交了短信签名和模板的申请之后，需要等待它们生效。这时候我们可以回到 [短信服务控制台概览](https://dysms.console.aliyun.com/overview) 发送测试短信。如果你的签名和模板都已经通过审核，你可以直接使用它们测试；如果它们还没有通过审核，阿里云也提供了测试模板供使用。
    - 在发送测试短信之前，可能你需要对账户进行小额的充值。
    - 测试时也需要提前绑定测试使用的手机号码以成功收到测试短信。点击 [短信服务控制台概览](https://dysms.console.aliyun.com/overview) 侧边栏上的「快速学习」标签页以了解更多。

## 编写连接器的 JSON

1. 前往 [短信服务控制台概览](https://dysms.console.aliyun.com/overview)，将鼠标悬停在页面右上角的头像处，进入「AccessKey 管理」并点按「创建 AccessKey」。完成了安全验证之后，你会得到一对「AccessKey ID」和「AccessKey Secret」，请妥善保管他们。
2. 前往你之前访问过的「国内消息」或「国际/港澳台消息」标签页，可以很快找到「签名名称」和「模板 CODE」。
    - 如果你想使用测试专用的签名模板, 则前往「快速开始」标签页，你就能在「测试专用签名模版」下方找到它们。
3. 完成阿里云短信服务连接器的设置：
    - 用你在步骤 1 中拿到的一对「AccessKey ID」和「AccessKey Secret」来分别填入 `accessKeyId` 和 `accessKeySecret`。
    - 用你在步骤 2 中拿到的「签名名称」填入 `signName` 栏。所有的模板都会共用这个签名。
    - 你可以添加多个短信服务模板以应对不同的用户场景。这里展示填写单个模板的例子：
      - `templateCode` 栏是你可以用来控制所发送短信内容的属性。它们的值从步骤 2 中的「模板 CODE」获取。
      - `usageType` 栏填写 `Register`，`SignIn` 或者 `Test` 其中之一以分别对应 _注册_，_登录_ 和 _测试_ 的不同场景。（`usageType` 是 Logto 的属性，用来确定使用场景。）

这是一个阿里云短信服务连接器 JSON 配置的样例。

```json
{
    "accessKeyId": "<your-access-key-id>",
    "accessKeySecret": "<your-access-key-secret>",
    "signName": "<Aliyun>",
    "templates": [
        {
            "templateCode": "<SMS_123456>",
            "usageType": "Register"
        },
        {
            "templateCode": "<SMS_234567>",
            "usageType": "SignIn"
        },
        {
            "templateCode": "<SMS_345678>",
            "usageType": "Test"
        },
    ]
}
```

### 测试阿里云短信连接器

你可以在「保存并完成」之前输入一个手机号码并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用短信或邮件验证码登录](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-passcode-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8) 吧。

### 配置类型

| 名称            | 类型        |
|-----------------|------------|
| accessKeyId     | string     |
| accessKeySecret | string     |
| signName        | string     |
| templates       | Template[] |

| 模板属性      | 类型         | 枚举值                            |
|--------------|-------------|----------------------------------|
| templateCode | string      | N/A                              |
| usageType    | enum string | 'Register' \| 'SignIn' \| 'Test' |


## 参考

- [阿里云短信服务 - 快速学习](https://dysms.console.aliyun.com/quickstart)

