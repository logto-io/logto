---
"@logto/connector-aliyun-sms": minor
---

add `strictPhoneRegionNumberCheck` to config with default value `false`

When this configuration is enabled, the connector will assume by default that all phone numbers include a valid region code and rely on this to determine whether the phone number belongs to mainland China. If your users' phone numbers do not include a region code due to historical reasons, their sign-in processes may be affected. Please enable this setting with caution.
