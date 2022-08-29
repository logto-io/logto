# SendGrid mail connector

The official Logto connector for SendGrid email service.

SendGrid 邮件服务 Logto 官方连接器 [中文文档](#sendgrid-邮件连接器)

**Table of contents**

- [SendGrid mail connector](#sendgrid-mail-connector)
  - [Get started](#get-started)
  - [Register SendGrid account](#register-sendgrid-account)
  - [Verify senders](#verify-senders)
  - [Create API keys](#create-api-keys)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test SendGrid email connector](#test-sendgrid-email-connector)
    - [Config types](#config-types)
- [SendGrid 邮件连接器](#sendgrid-邮件连接器)
  - [开始上手](#开始上手)
  - [创建 SendGrid 帐号](#创建-sendgrid-帐号)
  - [验证 sender](#验证-sender)
  - [创建 API 密钥](#创建-api-密钥)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [测试 SendGrid 邮件连接器](#测试-sendgrid-邮件连接器)
    - [配置类型](#配置类型)

## Get started

SendGrid (i.e. Twilio SendGrid) is a customer communication platform for transactional and marketing email. We can use its email sending function to send a _verification code_.

## Register SendGrid account

Create a new account at [SendGrid website](https://app.sendgrid.com/). You may skip this step if you've already got an account.

## Verify senders

Go to the [SendGrid console page](https://app.sendgrid.com/) and sign in with your SendGrid account.

Senders indicate the addresses our verification code email will be sent from. In order to send emails via the SendGrid mail server, you need to verify at least one sender.

Starting from the [SendGrid console page](https://app.sendgrid.com/), go to "Settings" -> "Sender Authentication" from the sidebar.

Domain Authentication is recommended but not obligatory. You can click "Get Started" in "Authenticate Your Domain" card and follow the upcoming guide to link and verify a sender to SendGrid.

By clicking the "Verify a Single Sender" button in the panel, you are now focusing on a form requiring some critical information to create a sender. Follow the guide, fill out all these fields, and hit the "Create" button.

After the single sender is created, an email with a verification link should be sent to your sender's email address. Go to your mailbox, find the verification mail and finish verifying the single sender by clicking the link given in the email. You can now send emails via SendGrid connector using the sender you've just verified.

## Create API keys

Let's start from the [SendGrid console page](https://app.sendgrid.com/), go to "Settings" -> "API Keys" from the sidebar.

Click the "Create API Key" in the top-right corner of the API Keys page. Type in the name of the API key and customize "API Key Permission" per your use case. A global `Full Access` or `Restricted Access` with full access to Mail Send is required before sending emails with this API key.

The API Key is presented to you on the screen as soon as you finished the _Create API Key_ process. You should save this API Key somewhere safe because this is the only chance that you can see it.

## Compose the connector JSON

Fill out the `apiKey` field with the API Key created in "Create API keys" section.

Fill out the `fromEmail` and `fromName` fields with the senders' _From Address_ and _Nickname_. You can find the sender's details on the ["Sender Management" page](https://mc.sendgrid.com/senders). `fromName` is OPTIONAL, so you can skip filling it.

You can add multiple SendGrid mail connector templates for different cases. Here is an example of adding a single template:

- Fill out the `subject` field, which works as the title of emails.
- Fill out the `content` field with arbitrary string-typed contents. Do not forget to leave the `{{code}}` placeholder for the random passcode.
- Fill out `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.
- Fill out `type` field with either `text/plain` or `text/html` for different types of content.

Here is an example of SendGrid connector config JSON.

```jsonc
{
    "apiKey": "<your-api-key>",
    "fromEmail": "<noreply@logto.io>",
    "fromName": "<logto>", // This is OPTIONAL
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "type": "text/plain"
        },
        {
            "subject": "<sign-in-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (sign-in template)>",
            "usageType": "SignIn",
            "type": "text/plain"
        },
        {
            "subject": "<test-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (test template)>",
            "usageType": "Test",
            "type": "text/plain"
        },
    ]
}
```

### Test SendGrid email connector

You can type in an email address and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/tutorials/get-started/enable-passcode-sign-in/#enable-connector-in-sign-in-experience)

### Config types

| Name      | Type              |
|-----------|-------------------|
| apiKey    | string            |
| fromEmail | string            |
| fromName  | string (OPTIONAL) |
| templates | Template[]        |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| subject             | string      | N/A                              |
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |
| type                | enum string | 'text/plain' \| 'text/html'      |

# SendGrid 邮件连接器

## 开始上手

SendGrid（即 Twilio SendGrid）是一个用于交易和营销电子邮件的通信平台。我们可以使用它的电子邮件发送功能来发送 _verification code_。

## 创建 SendGrid 帐号

在 [SendGrid](https://app.sendgrid.com/) 创建一个新帐号。如果已经拥有帐号则可以跳过这一步。

## 验证 sender

前往 [SendGrid 控制台](https://app.sendgrid.com/) 并用 SendGrid 帐号登录。

_Sender_ 指的是验证码邮件发出的地址。若是要通过 SendGrid 邮件服务器对外发送邮件，你需要验证通过至少一个 _sender_。

从 [SendGrid 控制台](https://app.sendgrid.com/) 开始，从侧边栏依次前往 "Settings" -> "Sender Authentication"。

_Domain Authentication_ 是推荐，但是不强制的。你可以点按 "Authenticate Your Domain" 卡片中的 "Get Started" 按钮，并各随其中的流程完成对 SendGrid _sender_ 的验证。

点按 "Verify a Single Sender" 按钮，便会弹出需要输入一些重要信息以创建 _sender_ 的页面。跟随指引，把相关信息填入输入栏中，点按 "Create" 按钮。

在创建好了单个的 _sender_ 以后，你会收到一封带有验证链接的邮件发送到你配置的 _sender_ 邮箱。前往收件箱，找到邮件并通过其中的链接完成验证。如此一来，你便可以通过 SendGrid 连接器从你验证过的 _sender_ 邮件地址发送邮件了。

## 创建 API 密钥

从 [SendGrid 控制台](https://app.sendgrid.com/) 的侧边栏，前往 "Settings" -> "API Keys"。

点按 _API Keys_ 页面右上角 "Create API Key" 按钮。输入 _API Key_ 的名字并根据使用场景选择合适的 "API Key Permission"。该 _API Key_ 需要全局的 `Full Access` 或者拥有「发送邮件」所有权限的 `Restricted Access` 才能发送邮件。

完成 _Create API Key_ 流程之后，_API Key_ 会出现在屏幕上。出于安全因素，_API Key_ 只会出现这一次，因此你需要将它妥善保管。

## 编写连接器的 JSON

用在 "Create API Key" 中获取的 _API Key_ 值，填入 `apiKey` 栏中。

用 _sender_ 的 _From Address_ 和 _Nickname_ 的值分别填写给 `fromEmail` 和 `fromName` 栏。你可以在 ["Sender Management"](https://mc.sendgrid.com/senders) 找到这些值。`fromName` 栏是 **可选的**，所以你可以将其留白。

你可以为不同的使用场景为 SendGrid 邮件连接器添加多个内容模板，这里我们给出添加单个模板的样例：

- 填写 `subject` 栏，它是发送邮件的标题
- 用字符型的值填入 `content` 栏，不要忘了用占位符 `{{code}}` 预留你想放置随机生成的验证码的位置
- 从 `Register`，`SignIn` 或 `Test` 中选一个填入 `usageType` 栏，以决定当前模板所使用的场景
- 用 `text/plain` 或 `text/html` 填入 `type` 栏，以表明内容的形式

这是一个 SendGrid 邮件服务连接器 JSON 配置的样例。

```jsonc
{
    "apiKey": "<your-api-key>",
    "fromEmail": "<noreply@logto.io>",
    "fromName": "<logto>", // This is OPTIONAL
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register",
            "type": "text/plain"
        },
        {
            "subject": "<sign-in-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (sign-in template)>",
            "usageType": "SignIn",
            "type": "text/plain"
        },
        {
            "subject": "<test-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (test template)>",
            "usageType": "Test",
            "type": "text/plain"
        },
    ]
}
```

### 测试 SendGrid 邮件连接器

你可以在「保存并完成」之前输入一个邮箱地址并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用短信或邮件验证码登录](https://docs.logto.io/zh-cn/docs/tutorials/get-started/enable-passcode-sign-in/#%E5%9C%A8%E7%99%BB%E5%BD%95%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%90%AF%E7%94%A8%E8%BF%9E%E6%8E%A5%E5%99%A8) 吧。

### 配置类型

| 名称       | 类型              |
|-----------|-------------------|
| apiKey    | string            |
| fromEmail | string            |
| fromName  | string (OPTIONAL) |
| templates | Template[]        |

| 模板属性   | 类型         | 枚举值                            |
|-----------|-------------|----------------------------------|
| subject   | string      | N/A                              |
| content   | string      | N/A                              |
| usageType | enum string | 'Register' \| 'SignIn' \| 'Test' |
| type      | enum string | 'text/plain' \| 'text/html'      |
