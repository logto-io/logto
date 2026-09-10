---
"@logto/connector-kit": patch
---

reject the OIDC `none` prompt when combined with other prompts

`oidcPromptsGuard` accepted `none` alongside `consent` or `select_account`. OIDC Core 1.0 section 3.1.2.1 states that `none` requests that no authentication or consent UI be shown, and that a request containing `none` with any other value is an error.

Because the combination passed validation, it could be saved from the Admin Console and was then joined into a single `prompt` parameter, so the identity provider was the first thing to reject it — Google answers `invalid_request: Invalid prompt: select_account consent none`, leaving the end user on a provider error page instead of a sign-in screen. The guard is shared by the Google and Azure AD connectors, so both were affected.

The invalid combination is now rejected at config time.
