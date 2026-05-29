---
"@logto/cli": minor
"@logto/schemas": patch
---

add `--dapc` (alias `--disable-admin-pwned-password-check`) option to both `install` and `db seed` commands for air-gapped OSS deployments.

The admin tenant's seeded password policy enables the Have I Been Pwned (HIBP) breach check by default, which sends an outbound request to `api.pwnedpasswords.com` on every admin password submission. This causes the first admin sign-up to hang on deployments where the endpoint is unreachable. Passing the option seeds the policy with the breach check disabled, so admin sign-up no longer depends on outbound network access.
