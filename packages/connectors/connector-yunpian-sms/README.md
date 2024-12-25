# Yunpian SMS connector

The official Logto connector for Yunpian SMS service. [中文文档](https://github.com/logto-io/logto/tree/master/packages/connectors/connector-yunpian-sms/README.zh-CN.md)

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
