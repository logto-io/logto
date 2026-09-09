---
'@logto/core': patch
---

reject the protected app default domain as a custom domain

Adding a hostname under the protected app default domain (for example `foo.dev.protected.app`) as a custom domain now fails with `domain.domain_is_not_allowed`. Such hostnames are assigned by Logto when an app is created, and adding one as a custom domain produced a domain that showed as "In use" but never served the site.
