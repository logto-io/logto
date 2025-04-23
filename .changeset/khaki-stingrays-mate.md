---
"@logto/core": minor
---

feat: support custom identifier lockout (sentinel) settings

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

3. Manual unblock:

   A new API endpoint has been introduced to manually unblock a specified list of identifiers. This feature is useful for administrators to unlock users who have been temporarily locked out due to exceeding the maximum failed attempts.

   Endpoint: `POST /api/sentinel-activities/delete`

   This endpoint allows for the bulk deletion of all sentinel activities within an hour in the database based on the provided identifiers, effectively unblocking them.
