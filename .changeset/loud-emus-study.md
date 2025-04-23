---
"@logto/schemas": minor
---

feat: add new `sentinelPolicy` field to the `signInExperience` settings

We have introduced a new field, `sentinelPolicy`, in the `signInExperience` settings. This field allows customization of lockout settings for identifiers in your Logto application. By default, it is set to an empty object, which means the default lockout policy will apply. The properties of the new field are as follows:

```ts
type SentinelPolicy = {
  maxAttempts?: number;
  lockoutDuration?: number;
};
```

1. Maximum failed attempts:

   - This limits the number of consecutive failed authentication attempts per identifier within an hour. If the limit is exceeded, the identifier will be temporarily locked out.
   - Default Value: 100

2. Lockout duration (minutes):

   - This specifies the period during which all authentication attempts for the given identifier are blocked after exceeding the maximum failed attempts.
   - Default Value: 60 minutes
