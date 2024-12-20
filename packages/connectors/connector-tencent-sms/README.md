# Tencent short message service connector

The official Logto connector for Tencent short message service.

**Table of contents**

- [Tencent short message service connector](#tencent-short-message-service-connector)
  - [Get started](#get-started)
  - [Set up a short message service in Tencent Cloud](#set-up-a-short-message-service-in-tencent-cloud)
    - [Create an Tencent Cloud account](#create-an-tencent-cloud-account)
  - [Compose the connector JSON](#compose-the-connector-json)
    - [Test Tencent Cloud SMS connector](#test-tencent-cloud-sms-connector)
    - [Config types](#config-types)
  - [References](#references)

## Get started

Tencent Cloud is a primary cloud service provider in Asia, offering various services, including SMS (short message service).

Tencent Short Message Service connector is an official Logto integration that helps end-users register or sign in using SMS verification codes.

## Set up a short message service in Tencent Cloud

### Create an Tencent Cloud account

Go to the [Tencent Cloud website](https://cloud.tencent.com/) and register your account if you don't have one.

1. Sign-in with your account at the [Tencent Cloud website](https://cloud.tencent.com/) and go to the [SMS service console page](https://cloud.tencent.com/product/sms).
2. Click the “Free Trial” (免费试用) button on the SMS service page and follow the setup steps.
3. Agree to the “Terms of SMS Service Activation” (短信开通服务条款) and click “Activate Service” (开通服务) to proceed.
4. On the “[SMS Console Overview](https://console.cloud.tencent.com/smsv2)” (短信服务控制台概览), choose “Domestic Messages”(国内消息) or “International/Hong Kong, Macao, Taiwan Messages”(国际/港澳台消息) from the sidebar based on your needs.
5. Add a signature and template for SMS messages. Note:
   - When adding a “Signature” (签名), select “Verification Code” (验证码) under the "Applicable Scenarios" (模版类型) field.
   - When adding a template, choose “Verification Code” as the template type.
   - Include a placeholder `{1}` in the template content, which will be replaced by a randomly generated code.
   - Templates with multiple placeholders are not supported. Use or create a single-placeholder template.
6. Submit the signature and template for approval. After submission:
   - Wait for them to take effect.
   - Test SMS can be sent from the “[SMS Console Overview](https://console.cloud.tencent.com/smsv2)” (短信服务控制台概览). Approved signatures and templates can be used directly for testing, or use the testing templates provided if they are still under review.
   - Ensure your account has sufficient balance for testing and pre-register the test phone number to receive SMS successfully.

For detailed guidance, click the “Getting Started Guide” (新手配置指引) tab in the SMS Console Overview.

## Compose the connector JSON

1. Go to the “[SMS Console Overview](https://console.cloud.tencent.com/smsv2)” and hover over your avatar in the top-right corner. Navigate to “Access Management > Access Keys > API Keys” to generate your `AccessKey ID` and `AccessKey Secret` after completing security verification. Please keep them properly.
2. From the “Domestic Messages” (国内消息) or “International/Hong Kong, Macao, Taiwan Messages” (国际/港澳台消息) tab, retrieve the “Signature Name” (签名名称) and “Template Code” (模版 CODCE).
   - For testing templates, check the “Getting Started” (快速开始) tab under "Test-Exclusive Templates" (测试专用签名模版).

- Configure the Tencent Cloud SMS Connector with the following fields:
  - `accessKeyId` and `accessKeySecret`: Use the credentials from step 1.
  - `signName`: The signature name obtained in step 2. This applies to all templates.
  - Add multiple templates for different scenarios if needed. Example for a single template:
    - `templateCode`: Retrieved from the “Template Code” in step 2.
    - `usageType`: Specify one of `Register`, `SignIn`, `ForgotPassword`, or `Generic` for different scenarios (Logto-specific property).
    - Ensure templates are configured for all four scenarios to complete the flow.
  - `sdkAppId`: Found in “[Application Management](https://console.cloud.tencent.com/smsv2/app-manage)” (应用管理).
  - `region`: Specify the supported region from the “[Sending Documentation](https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8)” (发送文档).

### Test Tencent Cloud SMS connector

You can type in a phone number and click on "Send" to see whether the settings can work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](/connectors/sms-connectors#enable-phone-number-sign-up-or-sign-in).

### Config types

| Name            | Type       |
| --------------- | ---------- |
| accessKeyId     | string     |
| accessKeySecret | string     |
| signName        | string     |
| region          | string     |
| sdkAppId        | string     |
| templates       | Template[] |

| Template Properties | Type        | Enum values                                             |
| ------------------- | ----------- | ------------------------------------------------------- |
| templateCode        | string      | N/A                                                     |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |

## References

- [How to implement SMS verification code function?](https://cloud.tencent.com/document/product/382/43070)
