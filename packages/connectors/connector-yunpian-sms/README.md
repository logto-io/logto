# Yunpian SMS connector

The official Logto connector for Yunpian SMS service.

云片网短信服务 Logto 官方连接器 [中文文档](#云片网短信连接器)

**Table of contents**

- [Yunpian SMS connector](#yunpian-sms-connector)
  - [Get started](#get-started)
  - [Set up SMS service in Yunpian Console](#set-up-sms-service-in-yunpian-console)
    - [Create a Yunpian account](#create-a-yunpian-account)
    - [Get API KEY](#get-api-key)
    - [Configure SMS templates](#configure-sms-templates)
  - [Configure in Logto](#configure-in-logto)
  - [Notes](#notes)
  - [References](#references)
- [云片网短信连接器](#云片网短信连接器)
  - [开始使用](#开始使用)
  - [在云片网中配置](#在云片网中配置)
    - [创建云片网账号](#创建云片网账号)
    - [获取 API KEY](#获取-api-key)
    - [配置短信模板](#配置短信模板)
  - [在 Logto 中配置](#在-logto-中配置)
  - [注意事项](#注意事项)
  - [参考](#参考)

## Get started

Yunpian is a communication service provider offering various services including SMS. The Yunpian SMS Connector is a plugin provided by the Logto team to integrate with Yunpian's SMS service, enabling Logto end-users to register and sign in via SMS verification codes.

## Set up SMS service in Yunpian Console

### Create a Yunpian account

Visit [Yunpian's website](https://www.yunpian.com/) to register an account and complete real-name verification.

### Get API KEY

1. Log in to Yunpian Console
2. Go to "Account Settings" -> "Sub-account Management"
3. Find and copy the API KEY

### Configure SMS templates

1. In Yunpian Console, go to "Domestic SMS" -> "Signature Filing"
2. Create and submit a signature, wait for carrier approval
3. Go to "Domestic SMS" -> "Template Filing" and select "Verification Code"
4. Create a verification code template, ensure it includes the `#code#` variable (you can also use "Common Templates" to speed up the approval process)
5. Wait for template approval
6. If you need to send international SMS, repeat the above steps but select "International SMS" -> "Template Filing"

## Configure in Logto

1. In Logto Console, go to "Connectors"
2. Find and click "Yunpian SMS Service"
3. Fill in the configuration form:
   - API KEY: The API KEY obtained from Yunpian
   - SMS templates: Configure templates according to usage, ensure they match exactly with approved templates in Yunpian

## Notes

1. SMS template content must match exactly with the approved template in Yunpian
2. The verification code variable placeholder in Yunpian templates is `#code#`, while in the connector configuration it's `{{code}}`
3. Yunpian automatically adds the default signature based on API KEY, no need to include signature in the template content
4. It's recommended to test the configuration before formal use

## References

- [Yunpian Development Documentation](https://www.yunpian.com/official/document/sms/zh_CN/introduction_brief)
- [Logto SMS Connector Guide](https://docs.logto.io/docs/recipes/configure-connectors/sms-connector/)

# 云片网短信连接器

Logto 官方云片网短信连接器。

## 开始使用

云片网是一家通信服务提供商，提供包括短信在内的多种通信服务。云片网 SMS 连接器是由 Logto 团队提供的插件，用于调用云片网的短信服务，帮助 Logto 终端用户通过短信验证码进行注册和登录。

## 在云片网中配置

### 创建云片网账号

访问[云片网官网](https://www.yunpian.com/)，注册账号并完成实名认证。

### 获取 API KEY

1. 登录云片网控制台
2. 进入"账户设置" -> "子账户管理"
3. 找到并复制 API KEY

### 配置短信模板

1. 在云片网控制台中进入"国内短信" -> "签名报备"
2. 创建签名并提交，等待运营商审核通过
3. 在云片网控制台中进入"国内短信" -> "模板报备"，选择"验证码类"
4. 创建验证码类短信模板，确保模板中包含 `#code#` 变量（也可以直接使用`常用模板`申请，加快审核速度）
5. 等待模板审核通过
6. 如果您需要发送国际短信，请重复上述步骤，选择"国际短信" -> "模板报备"并提交

## 在 Logto 中配置

1. 在 Logto 管理控制台中转到"连接器"
2. 找到并点击"云片短信服务"
3. 在配置表单中填入:
   - API KEY: 从云片网获取的 API KEY
   - 短信模板: 按照用途配置相应的模板内容，确保与云片网审核通过的模板内容一致

## 注意事项

1. 短信模板内容必须与云片网审核通过的模板完全一致
2. 短信审核模板中的验证码变量占位符为 `#code#`，模板配置中验证码变量占位符为 `{{code}}`
3. 云片网会自动根据 API KEY 添加默认签名，无需在发送模板内容中包含签名
4. 建议在正式使用前进行测试，确保配置正确

## 参考

- [云片网开发文档](https://www.yunpian.com/official/document/sms/zh_CN/introduction_brief)
- [Logto SMS 连接器指南](https://docs.logto.io/zh-CN/connectors/sms-connectors) 