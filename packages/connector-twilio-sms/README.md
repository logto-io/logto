# Twilio short message service connector

The official Logto connector for Twilio short message service.

Twilio 短信服务 Logto 官方连接器 [中文文档](#twilio-短信连接器)

**Table of contents**

- [Twilio short message service connector](#twilio-short-message-service-connector)
  - [Get started](#get-started)
  - [Register Twilio account](#register-twilio-account)
  - [Set up senders' phone numbers](#set-up-senders-phone-numbers)
  - [Get account credentials](#get-account-credentials)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test Twilio SMS connector](#test-twilio-sms-connector)
    - [Config types](#config-types)
  - [Reference](#reference)
- [Twilio 短信连接器](#twilio-短信连接器)
  - [开始上手](#开始上手)
  - [创建 Twilio 帐号](#创建-twilio-帐号)
  - [设置 sender 号码](#设置-sender-号码)
  - [获取帐号凭据](#获取帐号凭据)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [测试 Twilio 短信连接器](#测试-twilio-短信连接器)
    - [配置类型](#配置类型)
  - [参考](#参考)

## Get started

Twilio provides programmable communication tools for making and receiving phone calls, sending and receiving text messages, and other communication functions. We can send the "verification code" text messages through its web service APIs.

## Register Twilio account

Create a new account on [Twilio](https://www.twilio.com). (Jump to the next step if you already have one.)

## Set up senders' phone numbers

Go to the [Twilio console page](https://console.twilio.com/) and sign in with your Twilio account.

Purchase a phone number under "Phone Numbers" -> "Manage" -> "Buy a number".

> ℹ️ **Tip**
>
> Sometimes you may encounter the situation that SMS service is not supported in specific countries or areas. Pick a number from other regions to bypass.

Once we have a valid number claimed, nav to the "Messaging" -> "Services". Create a new Message Service by clicking on the button.

Give a friendly service name and choose _Notify my users_ as our service purpose.
Following the next step, choose `Phone Number` as _Sender Type_, and add the phone number we just claimed to this service as a sender.

> ℹ️ **Note**
>
> Each phone number can only be linked with one messaging service.

## Get account credentials

We will need the API credentials to make the connector work. Let's begin from the [Twilio console page](https://console.twilio.com/).

Click on the "Account" menu in the top-right corner, then go to the "API keys & tokens" page to get your `Account SID` and `Auth token`.

Back to "Messaging" -> "Services" settings page starting from the sidebar, and find the `Sid` of your service.

## Compose the connector JSON

Fill out the _accountSID_, _authToken_ and _fromMessagingServiceSID_ fields with `Account SID`, `Auth token` and `Sid` of the corresponding messaging service.

You can add multiple SMS connector templates for different cases. Here is an example of adding a single template:

- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave `{{code}}` placeholder for random passcode.
- Fill out the `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.

Here is an example of Twilio SMS connector config JSON.

```json
{
    "accountSID": "<your-account-sid>",
    "authToken": "<your-auth-token>",
    "fromMessagingServiceSID": "<messaging-service-sid>",
    "templates": [
        {
            "content": "<arbitrary-register-template-contents: your passcode is {{code}}>",
            "usageType": "Register"
        },
        {
            "content": "<arbitrary-sign-in-template-contents: your passcode is {{code}}>",
            "usageType": "SignIn"
        },
        {
            "content": "<arbitrary-test-template-contents: your passcode is {{code}}>",
            "usageType": "Test"
        }
    ]
}
```

### Test Twilio SMS connector

You can enter a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-passcode-sign-in/#enable-connector-in-sign-in-experience).

### Config types

| Name                    | Type        |
|-------------------------|-------------|
| accountSID              | string      |
| authToken               | string      |
| fromMessagingServiceSID | string      |
| templates               | Templates[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |

## Reference

- [Twilio - Error and Warning Dictionary](https://www.twilio.com/docs/api/errors)

# Twilio 短信连接器

## 开始上手

Twilio 提供可编程的通信工具，用于拨打和接听电话、发送和接收文本信息以及其他通信功能。我们可以通过其网络服务 API 发送 "验证码" 文本信息。

## 创建 Twilio 帐号

在 [Twilio](https://www.twilio.com) 创建新帐号。（如果你已经有账号了请跳到下一步。）

## 设置 sender 号码

前往 [Twilio 控制台](https://console.twilio.com/) 并登录 Twilio 账号。

依次进入 "Phone Numbers" -> "Manage" -> "Buy a number"，购买电话号码。

> ℹ️ **小贴士**
>
> 有时候你会碰到某些国家或区域的号码不支持短信服务的情况，挑选一个其他区域的号码来绕过该限制。

获取了有效号码之后，按照导航前往 "Messaging" -> "Services"，点按 "Create Messaging Service" 按钮新建一个短信服务。

填写一个服务名称然后在服务用途选择 _Notify my users_。

继续下一步，为 _Sender Type_ 选择 `Phone number` 并把之前获取的手机号添加为这个发信服务的 _sender_。

> ℹ️ **注意**
>
> 每个号码只能绑定到唯一一个发信服务。

## 获取帐号凭据

我们需要获取 API 凭据来使得连接器正常工作。从 [Twilio 控制台](https://console.twilio.com/) 开始获取密钥的流程。

点按页面右上角的 "Account" 菜单并前往 "API keys & tokens" 页面，通过验证后获取 `Account SID` 和 `Auth token`。

通过侧边栏回到 "Messaging" -> "Services" 设置页面，找到发信服务的 `Sid`。

## 编写连接器的 JSON

用发信服务中获取的 `Account SID`、`Auth token` 和 `Sid` 信息分别对应填写 _accountSID_、_authToken_ 和 _fromMessagingServiceSID_ 栏。

你可以添加多个短信连接器的内容模板以应对不同的使用场景。这里我们以添加单个内容模板举例：

- 用任意字符型内容填写 `content` 栏。不要忘了用 `{{code}}` 占位符为随机生成的验证码预留位置。
- 用 `Register`，`SignIn` 或 `Test` 填入 `usageType` 栏以声明不同的使用场景。

这是一个 Twilio 短信服务连接器 JSON 配置的样例。

```json
{
    "accountSID": "<your-account-sid>",
    "authToken": "<your-auth-token>",
    "fromMessagingServiceSID": "<messaging-service-sid>",
    "templates": [
        {
            "content": "<arbitrary-register-template-contents: your passcode is {{code}}>",
            "usageType": "Register"
        },
        {
            "content": "<arbitrary-sign-in-template-contents: your passcode is {{code}}>",
            "usageType": "SignIn"
        },
        {
            "content": "<arbitrary-test-template-contents: your passcode is {{code}}>",
            "usageType": "Test"
        }
    ]
}
```

### 测试 Twilio 短信连接器

你可以在「保存并完成」之前输入一个手机号码并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用短信或邮件验证码登录](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-passcode-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8) 吧。

### 配置类型

| 名称                     | 类型        |
|-------------------------|-------------|
| accountSID              | string      |
| authToken               | string      |
| fromMessagingServiceSID | string      |
| templates               | Templates[] |

| 模板属性   | 类型         | 枚举值                            |
|-----------|-------------|----------------------------------|
| content   | string      | N/A                              |
| usageType | enum string | 'Register' \| 'SignIn' \| 'Test' |

## 参考

- [Twilio - Error and Warning Dictionary](https://www.twilio.com/docs/api/errors)
