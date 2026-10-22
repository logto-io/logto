---
"@logto/core": minor
---

add an unlock action on the user details page to clear sign-in and security verification
lockouts

The action clears lockouts keyed on the user ID, primary email, primary phone, and username,
so an admin can unlock a user without knowing which identifier triggered the lockout.
