---
"@logto/core": minor
---

filter organizations by just-in-time provisioning email domain

`GET /api/organizations` accepts a new `jitEmailDomain` query parameter that returns, with pagination, the organizations that have this email domain for just-in-time provisioning, that is the organizations a user with this email domain would be provisioned into. It lets an integration find the organization of a domain, or check that a domain is not already used by another organization, without listing the email domains of every organization. It combines with `q` and the pagination like the other filters.
