---
"@logto/connector-aliyun-sms": patch
---

update Aliyun SMS connector config schema

- add a new field `strictPhoneRegionNumberCheck` (default `false`) to control whether to strictly check the region number of the phone number. With this option enabled, Aliyun SMS connector users can successfully send SMS to some overseas phone numbers (such as US, HK, etc,.)
