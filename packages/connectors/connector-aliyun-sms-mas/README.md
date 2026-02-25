# Aliyun Message Authentication Service connector

The official Logto connector for Aliyun Message Authentication Service.

阿里云短信认证服务 Logto 官方连接器 [中文文档](#阿里云短信认证连接器)

**Table of contents**

- [Aliyun Message Authentication Service connector](#aliyun-message-authentication-service-connector)
  - [Get started](#get-started)
  - [Differences and Limitations](#differences-and-limitations)
  - [Set up Message Authentication Service in Aliyun Console](#set-up-message-authentication-service-in-aliyun-console)
  - [Compose the connector JSON](#compose-the-connector-json)
  - [Config types](#config-types)
  - [References](#references)
- [阿里云短信认证连接器](#阿里云短信认证连接器)
  - [与短信服务的区别和限制](#与短信服务的区别和限制)
  - [在阿里云控制台配置短信认证服务](#在阿里云控制台配置短信认证服务)
  - [编写连接器的 JSON](#编写连接器的-json)
  - [配置类型](#配置类型)
  - [参考](#参考)

## Get started

Aliyun Message Authentication Service is a specialized service for verification code scenarios. Unlike the standard SMS service, it provides:

- System-provided signatures and templates (no application required)
- Built-in anti-fraud protection and rate limiting
- Simplified integration for verification code use cases

## Differences and Limitations

### Differences from Short Message Service (SMS)

For a detailed comparison between Message Authentication Service and Short Message Service, see [Aliyun Documentation](https://help.aliyun.com/zh/pnvs/product-overview/message-authentication).

Key differences:
- **SMS Service**: Requires applying for your own signatures and templates, supports various message types (verification codes, notifications, marketing), supports international numbers
- **Message Authentication Service**: Uses system-provided signatures and templates, verification code only, simplified integration

### Limitations

⚠️ **Important**: Message Authentication Service has the following limitations:

- **Domestic numbers only**: Currently only supports mobile numbers from China Mobile, China Unicom, and China Telecom (mainland China)
- **No international support**: Does NOT support Taiwan, Hong Kong, Macau, or overseas regions
- **No custom signatures**: As of November 12, 2025, Aliyun announced that "Due to carrier signature real-name policy control requirements, all authentication methods that use SMS verification codes under the Number Authentication product will not support using custom signatures to send SMS, specific recovery time will be notified separately."

If you need to send SMS to international numbers or regions outside mainland China, please use the [Aliyun Short Message Service connector](../connector-aliyun-sms/) instead.

## Set up Message Authentication Service in Aliyun Console

1. Go to the [Aliyun website](https://cn.aliyun.com/) and sign in with your account.
2. Navigate to [Message Authentication Service Console](https://dypns.console.aliyun.com/).
3. The service is already activated by default. You can directly use the system-provided signatures and templates.
4. Go to "AccessKey Management" from your avatar menu and create an AccessKey pair.

## Compose the connector JSON

1. Fill out the `accessKeyId` and `accessKeySecret` with your AccessKey pair.
2. Select a `signName` from the system-provided options:
   - 云渚科技验证平台
   - 云渚科技验证服务
   - 速通互联验证码
   - 速通互联验证平台
   - 速通互联验证服务
3. Configure templates using system-provided template codes:

| UsageType | Template Code | Description |
|-----------|--------------|-------------|
| SignIn | 100001 | Login verification |
| Register | 100001 | Registration verification |
| ForgotPassword | 100003 | Password reset |
| Generic | 100001 | General verification |

Example configuration:

```json
{
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "signName": "速通互联验证码",
  "templates": [
    { "usageType": "SignIn", "templateCode": "100001" },
    { "usageType": "Register", "templateCode": "100001" },
    { "usageType": "ForgotPassword", "templateCode": "100003" },
    { "usageType": "Generic", "templateCode": "100001" }
  ]
}
```

## Config types

| Name | Type | Description |
|------|------|-------------|
| accessKeyId | string | Aliyun Access Key ID |
| accessKeySecret | string | Aliyun Access Key Secret |
| signName | enum | System-provided signature name |
| templates | Template[] | Array of template configurations |

## References

- [Aliyun Message Authentication Service Documentation](https://help.aliyun.com/zh/pnvs/product-overview/message-authentication)
- [SendSmsVerifyCode API](https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode)

---

# 阿里云短信认证连接器

阿里云短信认证服务是专门为验证码场景设计的服务。与标准短信服务不同，它提供：

- 系统赠送的签名和模板（无需申请）
- 内置的防欺诈保护和频控机制
- 针对验证码场景的简化集成

## 与短信服务的区别和限制

### 与短信服务的区别

关于短信认证服务与短信服务的详细对比，请参阅[阿里云文档](https://help.aliyun.com/zh/pnvs/product-overview/message-authentication)。

主要区别：
- **短信服务**：需要自行申请签名和模板，支持多种短信类型（验证码、通知、营销），支持国际号码
- **短信认证服务**：使用系统赠送的签名和模板，仅支持验证码场景，接入更简单

### 使用限制

⚠️ **重要提示**：短信认证服务有以下限制：

- **仅限中国大陆手机号**：目前仅支持中国移动、中国联通和中国电信的手机号码（中国大陆）
- **不支持国际及港澳台**：**不支持**中国台湾、中国香港、中国澳门及海外地区使用
- **不支持自定义签名**：自2025年11月12日起，阿里云发布[公告](https://help.aliyun.com/zh/pnvs/product-overview/sms-service-does-not-support-custom-signatures)称“因运营商签名实名制政策管控要求，即日起号码认证产品下所有使用短信验证码触达的认证方式，均不支持使用自定义签名下发短信，具体恢复时间另行通知。”

如果您需要向国际号码或中国大陆以外的地区发送短信，请改用[阿里云短信服务连接器](../connector-aliyun-sms/)。

## 在阿里云控制台配置短信认证服务

1. 前往 [阿里云](https://aliyun.com/) 并登录账号。
2. 进入 [短信认证服务控制台](https://dypns.console.aliyun.com/)。
3. 服务开通后，可直接使用系统赠送的签名和模板。
4. 从头像菜单进入 "AccessKey 管理" 创建 AccessKey 密钥对。

## 编写连接器的 JSON

1. 填写 `accessKeyId` 和 `accessKeySecret` 为你的 AccessKey 密钥对。
2. 从系统赠送签名中选择一个填入 `signName`：
   - 云渚科技验证平台
   - 云渚科技验证服务
   - 速通互联验证码
   - 速通互联验证平台
   - 速通互联验证服务
3. 使用系统赠送模板代码配置模板：

| UsageType | 模板 CODE | 说明 |
|-----------|----------|------|
| SignIn | 100001 | 登录验证 |
| Register | 100001 | 注册验证 |
| ForgotPassword | 100003 | 重置密码 |
| Generic | 100001 | 通用验证 |

示例配置：

```json
{
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "signName": "速通互联验证码",
  "templates": [
    { "usageType": "SignIn", "templateCode": "100001" },
    { "usageType": "Register", "templateCode": "100001" },
    { "usageType": "ForgotPassword", "templateCode": "100003" },
    { "usageType": "Generic", "templateCode": "100001" }
  ]
}
```

## 配置类型

| 名称 | 类型 | 描述 |
|------|------|-------------|
| accessKeyId | string | 阿里云 Access Key ID |
| accessKeySecret | string | 阿里云 Access Key Secret |
| signName | enum | 系统赠送的签名名称 |
| templates | Template[] | 模板配置数组 |

## 参考

- [阿里云短信认证服务文档](https://help.aliyun.com/zh/pnvs/product-overview/message-authentication)
- [SendSmsVerifyCode API 文档](https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode)
