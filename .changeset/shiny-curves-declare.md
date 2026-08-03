---
'@logto/core': patch
---

declare the token signing algorithm that matches the signing key's curve

Previously, every Elliptic Curve signing key was declared as `ES384` regardless of its curve, so tenants seeded with a custom P-256 or P-521 private key advertised an algorithm their key cannot sign and clients failed validation at the authorization endpoint. The declared algorithm now follows the key's actual curve: P-256 declares `ES256`, P-384 declares `ES384`, and P-521 declares `ES512`. RSA keys keep the `RS256` default.
