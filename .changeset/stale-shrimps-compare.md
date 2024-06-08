---
"@logto/console": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/phrases": patch
---

enable backchannel logout support

Enable the support of [OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html).

To register for backchannel logout, navigate to the application details page in the Logto Console and locate the "Backchannel logout" section. Enter the backchannel logout URL of your RP and click "Save".

You can also enable session requirements for backchannel logout. When enabled, Logto will include the `sid` claim in the logout token.

For programmatic registration, you can set the `backchannelLogoutUri` and `backchannelLogoutSessionRequired` properties in the application `oidcClientMetadata` object.
