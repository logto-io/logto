---
'@logto/account': minor
'@logto/phrases-experience': minor
---

add a user menu with sign out to the Account Center header

The Account Center previously had no way to sign out. An avatar now sits in the top-right corner of the page header; opening it shows the signed-in user's name and email alongside a Sign out action that ends the session and returns to sign-in.

The avatar falls back to the first letter of the user's display name when no avatar image is set. The menu closes on an outside click or the Escape key.

Three stable class names are available for `customCss`: `logto_ac-user-menu`, `logto_ac-user-menu-avatar`, and `logto_ac-user-menu-dropdown`.
