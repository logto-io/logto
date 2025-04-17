---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/core": minor
---

add one-time token verification method to support magic link authentication

You can now use the "one-time token" to compose magic links, and send them to the end user's email.
With a magic link, one can register a new account or sign in directly to the application, without the need to enter a password, or input verification codes.

You can also use magic link to invite users to your organizations.

### Example API request to create a one-time token

```bash
POST /api/one-time-tokens
```

Request payload:

```jsonc
{
  "email": "user@example.com",
  // Optional. Defaults to 600 (10 mins).
  "expiresIn": 3600,
  // Optional. User will be provisioned to the specified organizations upon successful verification.
  "context": {
    "jitOrganizationIds": ["your-org-id"]
  }
}
```

### Compose your magic link

After you get the one-time token, you can compose a magic link and send it to the end user's email address. The magic link should at least contain the token and the user email as parameters, and should navigate to a landing page in your own application. E.g. `https://yourapp.com/landing-page`.

Here's a simple example of what the magic link may look like:

```http
https://yourapp.com/landing-page?token=YHwbXSXxQfL02IoxFqr1hGvkB13uTqcd&email=user@example.com
```

Refer to [our docs](https://docs.logto.io/docs/end-user-flows/one-time-token) for more details.
