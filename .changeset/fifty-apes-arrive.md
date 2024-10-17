---
"@logto/shared": patch
"@logto/core": patch
---

add environment variable to override default database connection timeout

By default, out database connection timeout is set to 5 seconds, which might not be enough for some network conditions. This change allows users to override the default value by setting the `DATABASE_CONNECTION_TIMEOUT` environment variable.
