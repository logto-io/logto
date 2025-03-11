---
"@logto/connector-aliyun-sms": patch
"@logto/connector-tencent-sms": patch
---

filter out `locale` parameter from the send message payload for AliyunSms and TencentSms connector.

Both connectors utilize `templateCode` to manage the i18n message template at the provider side, making the `locale` parameter unnecessary.

This is particularly relevant for the Aliyun SMS connector, which uses the `verification code` template for sending verification code messages. Since only `[a-zA-Z0-9]` characters are allowed in the message content, including the `locale` parameter will result in message sending failures. Therefore, we need to remove the `locale` parameter from the send message payload for both connectors.
