---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/console": minor
"@logto/shared": minor
"@logto/core": minor
---

add phone number validation to ensure valid format when updating existing users' primary phone or creating new users with a phone number

This prevents invalid phone numbers from being stored in the database and improves data integrity.
According to current Logto implementation, we ensure phone numbers got from experience flow are valid.
