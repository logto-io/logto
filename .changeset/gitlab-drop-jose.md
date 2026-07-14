---
"@logto/connector-gitlab": patch
---

remove the unused jose dependency

The GitLab connector declared jose as a dependency but never imported it, so installing the connector pulled in a package it did not need.
