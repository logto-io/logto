---
"@logto/connector-twilio-sms": patch
---

fix twilio sms `To` formatting by normalizing non-E.164 numbers to include a leading `+`.
