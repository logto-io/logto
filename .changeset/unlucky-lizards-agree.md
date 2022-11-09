---
"@logto/cli": minor
---

## CLI

### Rotate your private or secret key

We add a new command `db config rotate <key>` to support key rotation via CLI.

When rotating, the CLI will generate a new key and prepend to the corresponding key array. Thus the old key is still valid and the service will use the new key for signing.

Run `logto db config rotate help` for detailed usage.

### Trim the private or secret key you don't need

If you want to trim one or more out-dated private or secret key(s) from the config, use the command `db config trim <key>`. It will remove the last item (private or secret key) in the array.

You may remove the old key after a certain period (such as half a year) to allow most of your users have time to touch the new key.

If you want to remove multiple keys at once, just append a number to the command. E.g. `logto db config trim oidc.cookieKeys 3`.

Run `logto db config trim help` for detailed usage.
