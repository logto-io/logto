---
"@logto/core": patch
---

key identifier lockout on the normalized identifier

The identifier lockout counter is now keyed on the same form of the identifier that the user lookup matches on, so a single account maps to a single lockout bucket however the identifier was spelled in the request. Previously the counter keyed on the value exactly as submitted while the lookup normalized before matching, which let the two disagree and weakened the configured `maxAttempts` policy.

Emails are lower-cased and phone numbers canonicalized, matching their lookups. Usernames fold case only when the tenant's username policy is case-insensitive: under the default case-sensitive policy `Alice` and `alice` are different accounts and keep separate buckets, so attempts against one cannot lock out the other.

Manual unlock (`POST /sentinel-activities/delete`) also clears the other spellings of the submitted identifier, so unblocking works when an admin types an address in a different case. Case is only folded where both spellings must be the same account — always for an email address, and otherwise only when the tenant's username policy is case-insensitive — so an unlock can never reach a different account. Identifiers that are keyed verbatim still have to be submitted as they were typed.

Note for operators upgrading: lockouts are re-keyed by this change, so an active lockout recorded under a non-canonical spelling stops applying once deployed. Affected users are unblocked early, at most one `lockoutDuration` ahead of schedule; no user becomes more locked out than before, and failure counters older than an hour are already outside the counting window.
