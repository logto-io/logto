# Tencent short message service connector

The official Logto connector for Tencent short message service.

腾讯云短信服务 Logto 官方连接器 [中文文档](#腾讯云短信连接器)

**Table of contents**

- [Tencent short message service connector](#tencent-short-message-service-connector)
- [腾讯云短信连接器](#腾讯云短信连接器)
  - [在腾讯云短信服务控制台中配置一个短信服务](#在腾讯云短信服务控制台中配置一个短信服务)
    - [创建腾讯云账号](#创建腾讯云账号)
    - [启用并配置腾讯云短信服务](#启用并配置腾讯云短信服务)
  - [编写连接器的 JSON](#编写连接器的-json)
    - [测试腾讯云短信连接器](#测试腾讯云短信连接器)
    - [配置类型](#配置类型)
  - [参考](#参考)

# 腾讯云短信连接器

腾讯云是亚洲地区一个重要的云服务厂商，提供了包括短信服务在内的诸多云服务。

本连接器是 Logto 官方提供的腾讯云短信连接器，帮助终端用户通过短信验证码进行登录注册。

## 在腾讯云短信服务控制台中配置一个短信服务

> 💡 **Tip**
>
> 你可以跳过已经完成的部分。

### 创建腾讯云账号

前往 [腾讯云](https://cloud.tencent.com/) 并完成账号注册。

### 启用并配置腾讯云短信服务

1. 用刚刚在 [腾讯云](https://cloud.tencent.com/)
   注册的账号登录并前往 [短信服务控制台](https://cloud.tencent.com/product/sms)。
2. 点按短信服务页面左上角的「免费试用」按钮并开始配置的流程。
3. 阅读并同意「短信服务开通条款」和「开通服务」以继续。
4. 你现在处于「[短信服务控制台概览](https://console.cloud.tencent.com/smsv2)」，根据你的用户场景，点击侧边栏中的「国内消息」或者「国际/港澳台消息」。
5. 跟随指引添加签名和模板，并提供相应的材料和信息以便审核：
    - 注意：添加 **签名** 时要在「适用场景」栏选择「验证码」，添加 **模板**
      时「模板类型」也要选择「验证码」，因为我们使用这些签名和模板的目的就是发送验证码。目前暂不支持除发送验证码之外的其它类型文字短信。
    - 请同时注意要在模板的内容中加上 `{1}` 的占位符，其在实际发出的短信中会被随机生成的验证码所替代。
    - 目前不支持 **多个** 占位符，请选择或创建仅有一个占位符的模板。
6. 提交了短信签名和模板的申请之后，需要等待它们生效。这时候我们可以回到 [短信服务控制台概览](https://console.cloud.tencent.com/smsv2)
发送测试短信。如果你的签名和模板都已经通过审核，你可以直接使用它们测试；如果它们还没有通过审核，腾讯云也提供了测试模板供使用。
    - 在发送测试短信之前，你可能需要对账户进行小额的充值。
    - 需要在测试前提前绑定测试所使用的手机号码以便成功收取测试短信。点击 [短信服务控制台概览](https://console.cloud.tencent.com/smsv2)
    顶部栏目中的「新手配置指引」标签页以了解更多。

## 编写连接器的 JSON

1. 前往 [短信服务控制台概览](https://console.cloud.tencent.com/smsv2)
   ，将鼠标悬停在页面右上角的头像处，进入「访问管理」并点按左侧「访问密钥」以及 「[API 密钥](https://console.cloud.tencent.com/cam/capi)
   」。完成了安全验证之后，你会得到一对「AccessKey ID」和「AccessKey Secret」，请妥善保管它们。
2. 前往你之前访问过的「国内消息」或「国际/港澳台消息」标签页，可以很快找到「签名名称」和「模板 CODE」。
    - 如果你想使用测试专用的签名模板, 则前往「快速开始」标签页，你就能在「测试专用签名模版」下方找到它们。
3. 完成腾讯云短信服务连接器的设置：
    - 用你在步骤 1 中拿到的一对「AccessKey ID」和「AccessKey Secret」来分别填入 `accessKeyId` 和 `accessKeySecret`。
    - 用你在步骤 2 中拿到的「签名名称」填入 `signName` 栏。所有的模板都会共用这个签名。
    - 你可以添加多个短信服务模板以应对不同的用户场景。这里展示填写单个模板的例子：
        - `templateCode` 栏是你可以用来控制所发送短信内容的属性。它们的值从步骤 2 中的「模板 CODE」获取。
        - `usageType` 栏填写 `Register`，`SignIn`，`ForgotPassword` 或者 `Generic` 其中之一以分别对应 _注册_，
          _登录_，_忘记密码_，_通用_ 的不同场景。（`usageType` 是 Logto 的属性，用来确定使用场景。）为了能够使用完成的流程，需要配置 `usageType` 为 `Register`，`SignIn`, `ForgotPassword` 以及 `Generic` 的模板。
    - 在 [应用管理](https://console.cloud.tencent.com/smsv2/app-manage) 获取应用 ID 填写入 `sdkAppId` 栏。
    - 在 [发送文档](https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8)
      可以获取短信产品支持的地域，填写入 `region` 栏。

### 测试腾讯云短信连接器

你可以在「保存并完成」之前输入一个手机号码并点按「发送」来测试配置是否可以正常工作。

大功告成！快去 [启用短信或邮件验证码登录](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/enable-SMS-sign-in/)
吧。

### 配置类型

| 名称             | 类型       |
|-----------------|------------|
| accessKeyId     | string     |
| accessKeySecret | string     |
| signName        | string     |
| region          | string     |
| sdkAppId        | string     |
| templates       | Template[] |

| 模板属性      | 类型         | 枚举值                                                 |
|--------------|-------------|-------------------------------------------------------|
| templateCode | string      | N/A                                                   |
| usageType    | enum string | 'Register' \ | 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## 参考

- [腾讯云 如何实现短信验证码功能](https://cloud.tencent.com/document/product/382/43070)

