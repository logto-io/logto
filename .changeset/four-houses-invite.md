---
"@logto/core": patch
---

refactor: adjust TOTP secret length to 20 bytes

Update the TOTP secret generation to use 20 bytes (160 bits), following the recommendation in RFC 6238 (TOTP) and RFC 4226 (HOTP).

This aligns with the standard secret length used by most 2FA applications and provides better security while maintaining compatibility with existing TOTP validators.

Reference:
- RFC 6238 (TOTP) Section 5.1: https://www.rfc-editor.org/rfc/rfc6238#section-5.1
- RFC 4226 (HOTP) Section 4, Requirement 6: https://www.rfc-editor.org/rfc/rfc4226#section-4
