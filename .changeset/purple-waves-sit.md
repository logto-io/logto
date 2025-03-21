---
"@logto/core": patch
---

remove multiple sign-in experience settings restrictions

For better customization flexibility, we have removed following restrictions in the sign-in experience "sign-in and sign-up" settings:

1. The `password` field in sign-up settings is no longer required when username is set as the sign-up identifier. Developers may request a username without requiring a password during the sign-up process.

Note: If username is the only sign-up identifier, users without a password will not be able to sign in. Developers or administrators should carefully configure the sign-up and sign-in settings to ensure a smooth user experience.

Users can still set password via [account API](https://docs.logto.io/end-user-flows/account-settings/by-account-api) after sign-up.

2. The requirement that all sign-up identifiers must also be enabled as sign-in identifiers has been removed.
