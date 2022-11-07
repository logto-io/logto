---
"@logto/cli": minor
---

## CLI

### Rotate your private or secret key

Add a new command `db config rotate <key>` to support key rotation via CLI.

When rotating, the CLI will generate a new key and prepend to the corresponding key array. Thus the old key is still valid and the serivce will use the new key for signing.

Run `logto db config rotate help` for detailed usage.
