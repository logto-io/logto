---
"@logto/experience": patch
---

fix broken social link flow when username and email are both enabled as required sign-up identifiers and social IdP returns no verified email.

Repro:

- enable username+email as required sign-up identifiers;
- enable “require users to provide missing sign-up identifiers for social sign-in”;
- sign in with a new social identity lacking verified email;
- create new account, fulfill required username, then fulfill required email with an address already registered.

Expected: show link-and-sign-in modal and link the new social identity to the existing email account when user clicks on the `Link` button.

Actual: loses `link_social` state. User are prompt with a simple email exists confirm to sign-in modal instead. Clicking on `Sign In` button will perform a normal sign-in flow without linking the social identity.

Root cause: `link_social` query parameter wasn’t propagated after username fulfillment, so the email verification step lost linking context.

Fix: generate and append `link_social` during username fulfillment so it carries through to email verification and preserves the linking flow.
