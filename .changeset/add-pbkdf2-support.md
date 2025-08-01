---
"@logto/core": minor
---

add PBKDF2 support for legacy password verification

Added support for PBKDF2 (Password-Based Key Derivation Function 2) algorithm in legacy password verification. This enhancement allows the system to properly verify passwords that were hashed using PBKDF2 methods, improving compatibility with existing password systems during migration.

Example usage for user migration with PBKDF2-hashed passwords:

```json
{
  "username": "john_doe",
  "primaryEmail": "john.doe@example.com",
  "passwordAlgorithm": "Legacy",
  "passwordDigest": "[\"pbkdf2\", [\"mySalt123\", \"1000\", \"20\", \"sha512\", \"@\"], \"c465f66c6ac481a7a17e9ed5b4e2e7e7288d892f12bf1c95c140901e9a70436e\"]"
}
```

Where the arguments are:
- `salt`: user-defined salt value
- `iterations`: number of iterations (e.g., 1000)
- `keylen`: key length (e.g., 20)
- `digest`: hash algorithm (e.g., 'sha512')
- `@`: placeholder for the input password
