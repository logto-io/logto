---
"@logto/console": patch
"@logto/phrases": patch
---

Fix Cloud Console redirecting users who already belong to a tenant into the onboarding flow on sign-in

Sign-in routing is now based on the actual account state: users with a tenant go straight to it, users with pending invitations see the invitation list, and only users with neither are asked to create their first tenant.
