---
"@logto/schemas": minor
"@logto/core": minor
---

Add legacy password type supporting custom hasing function

You can now set the type of `password_encryption_method` to `legacy`, and store info with a JSON string format (containing a hash algorithm, arguments, and an encrypted password) in the `password_encrypted` field. By doing this, you can use any hash algorithm supported by Node.js, this is useful when migrating from other password hash algorithms, especially for the ones that include salt.

The format of the JSON string is as follows:

```json
["hash_algorithm", ["argument1", "argument2", ...], "expected_hashed_value"]
```

And you can use `@` as the input password in the arguments.

For example, if you are using SHA256 with a salt, you can store the password in the following format:

```json
["sha256", ["salt123", "@"], "c465f66c6ac481a7a17e9ed5b4e2e7e7288d892f12bf1c95c140901e9a70436e"]
```

Then when the user uses the password (`password123`), the `legacyVerify` function will use the `sha256` algorithm with the `salt123` and the input password to verify the password.

In this case, `salt123` is the first argument, `@` is the input password, then the following code will be executed:

```ts
const hash = crypto.createHash('sha256');
hash.update('salt123' + 'password123');
const expectedHashedValue = hash.digest('hex');
```
