---
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/cli": minor
"@logto/shared": minor
---

add grace period support to private signing key rotation

This update adds support for a grace period during private signing key rotation, through the environment variable `PRIVATE_KEY_ROTATION_GRACE_PERIOD`, or CLI `--gracePeriod` option.

During the grace period, the new signing key is marked as "Next", and the existing signing key remains active. This allows for a smoother transition when rotating keys, as it provides a window of time for clients to refresh cached JWKS without experiencing downtime or authentication failures.

After the grace period ends, the new private signing key will transition to "Current" state, and the old signing key will be marked as "Previous".

Check out the [documentation](https://docs.logto.io/logto-oss/using-cli/rotate-signing-keys) for more details.
