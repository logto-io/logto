---
'@logto/core': minor
'@logto/integration-tests': minor
'@logto/phrases': minor
'@logto/schemas': minor
'@logto/connector-kit': minor
---

add account api

Introduce the new Account API, designed to give end users direct API access without needing to go through the Management API, here is the highlights:

1. Direct access: The Account API empowers end users to directly access and manage their own account profile without requiring the relay of Management API.
2. User profile and identities management: Users can fully manage their profiles and security settings, including the ability to update identity information like email, phone, and password, as well as manage social connections. MFA and SSO support are coming soon.
3. Global access control: Admin has full, global control over access settings, can customize each fields.
4. Seamless authorization: Authorizing is easier than ever! Simply use `client.getAccessToken()` to obtain an opaque access token for OP (Logto), and attach it to the Authorization header as `Bearer <access_token>`.

## Get started

> ![Note]
> Go to the [Logto Docs](https://bump.sh/logto/doc/logto-user-api) to find full API reference.

1. Use `/api/account-center` endpoint to enable the feature, for security reason, it is disabled by default. And set fields permission for each field.
2. Use `client.getAccessToken()` to get the access token.
3. Attach the access token to the Authorization header of your request, and start interacting with the Account API directly from the frontend.
4. You may need to setup `logto-verification-id` header as an additional verification for some requests related to identity verification.

## What you can do with Account API

1. Get user account profile
2. Update basic information including name, avatar, username and other profile information
3. Update password
4. Update primary email
5. Update primary phone
6. Manage social identities
