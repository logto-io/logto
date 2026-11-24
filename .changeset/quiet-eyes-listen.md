---
"@logto/experience": patch
---

make the password visibility toggle and input labels accessible

The show/hide password button now works with Enter and Space as well as a pointer, is announced as "Show password", and reports its state with `aria-pressed`. Text inputs are now labelled by their visible label, so screen readers announce "Email" or "Password" instead of an unnamed field.
