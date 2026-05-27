---
"@logto/connector-smtp": patch
---

allow SMTP connector `auth` to omit `user` and `pass` so relays that authorize by source (e.g. IP/VLAN) can be configured without forging credentials
