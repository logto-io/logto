---
"@logto/core": minor
---

feat: introduce email blocklist policy

We have added a new `emailBlocklistPolicy` in the `signInExperience` settings. This policy allows you to customize the email restriction rules for all users. Once this policy is set, users will be restricted from signing up or linking their accounts with any email addresses that against the specified blocklist.
This feature is particularly useful for organizations that want to prevent users from signing up with personal email addresses or any other specific domains.

Available settings include:

- `customBlocklist`: A custom blocklist of email addresses or domains that you want to restrict.
- `blockSubaddressing`: Restrict email subaddressing (e.g., 'user+tag@example.com').
