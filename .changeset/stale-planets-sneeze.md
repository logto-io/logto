---
"@logto/console": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
"@logto/phrases": patch
---

support multiple app secrets with expiration

Now secure apps (machine-to-machine, traditional web, Protected) can have multiple app secrets with expiration. This allows for secret rotation and provides an even safer experience.

To manage your application secrets, go to Logto Console -> Applications -> Application Details -> Endpoints & Credentials.

We've also added a set of Management APIs (`/api/applications/{id}/secrets`) for this purpose.

> [!Important]
> You can still use existing app secrets for client authentication, but it is recommended to delete the old ones and create new secrets with expiration for enhanced security.
