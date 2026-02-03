---
"@logto/experience": patch
---

fix broken social link flow when username and email are both enabled as required sign-up identifiers and social IdP returns no verified email.

Repro:

- enable username+email as required sign-up identifiers;
- enable “require users to provide missing sign-up identifiers for social sign-in”;
- sign in with a new social identity lacking verified email;
- create new account, fulfill required username, then fulfill required email with an address already registered.

Expected: show a link-and-sign-in modal and link the new social identity to the existing email account when the user clicks the `Link` button.

Actual: the `link_social` state is lost. Users are prompted with a simple email-exists confirmation modal instead. Clicking the `Sign In` button performs a normal sign-in flow without linking the social identity.

Root cause: `link_social` query parameter wasn’t propagated after username fulfillment, so the email verification step lost linking context.

Fix: generate and append `link_social` during username fulfillment so it carries through to email verification and preserves the linking flow.
