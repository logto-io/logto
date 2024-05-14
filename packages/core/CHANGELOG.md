# Change Log

## 1.16.0

### Minor Changes

- 8ef021fb3: add support for Redis Cluster and extra TLS options for Redis connections
- 21bb35b12: refactor the definition of hook event types

  - Add `DataHook` event types. `DataHook` are triggered by data changes.
  - Add "interaction" prefix to existing hook event types. Interaction hook events are triggered by end user interactions, e.g. completing sign-in.

- e8c41b164: support organization custom data

  Now you can save additional data associated with the organization with the organization-level `customData` field by:

  - Edit in the Console organization details page.
  - Specify `customData` field when using organization Management APIs.

- 5872172cb: enable custom JWT feature for OSS version

  OSS version users can now use custom JWT feature to add custom claims to JWT access tokens payload (previously, this feature was only available to Logto Cloud).

- 1ef32d6d5: update token grant to support organization API resources

  Organization roles can be assigned with scopes (permissions) from the API resources, and the token grant now supports this.

  Once the user is consent to an application with "resources" assigned, the token grant will now include the scopes inherited from all assigned organization roles.

  Users can narrow down the scopes by passing `organization_id` when granting an access token, and the token will only include the scopes from the organization roles of the specified organization, the access token will contain an extra claim `organization_id` to indicate the organization the token is granted for. Then the resource server can use this claim to protect the resource with additional organization-level authorization.

  This change is backward compatible, and the existing token grant will continue to work as before.

### Patch Changes

- 52df3ebbb: Bug fix: organization invitation APIs should handle invitee emails case insensitively
- 368385b93: Management API will not return 500 in production for status codes that are not listed in the OpenAPI spec
- d54530356: Fix OIDC AccessDenied error code to 403.

  This error may happen when you try to grant an access token to a user lacking the required permissions, especially when granting for orgnization related resources. The error code should be 403 instead of 400.

- 5b03030de: Not allow to modify management API resource through API.

  Previously, management API resource and its scopes are readonly in Console. But it was possible to modify through the API. This is not allowed anymore.

- 5660c54cb: Sign out user after deletion or suspension

  When a user is deleted or suspended through Management API, they should be signed out immediately, including sessions and refresh tokens.

- a9ccfc738: implement request ID for API requests

  - All requests will now include a request ID in the headers (`Logto-Core-Request-Id`)
  - Terminal logs will now include the request ID as the prefix

- bbd399e15: fix the new user from SSO register hook event not triggering bug

  ### Issue

  When a new user registers via SSO, the `PostRegister` interaction hook event is not triggered. `PostSignIn` event is mistakenly triggered instead.

  ### Root Cause

  In the SSO `post /api/interaction/sso/:connectionId/registration` API, we update the interaction event to `Register`.
  However, the hook middleware reads the event from interaction session ahead of the API logic, and the event is not updated resulting in the wrong event being triggered.

  In the current interaction API design, we should mutate the interaction event by calling the `PUT /api/interaction/event` API, instead of updating the event directly in the submit interaction APIs. (Just like the no direct mutation rule for a react state). So we can ensure the correct side effect like logs and hooks are triggered properly.

  All the other sign-in methods are using the `PUT /api/interaction/event` API to update the event. But when implementing the SSO registration API, we were trying to reduce the API requests and directly updated the event in the registration API which will submit the interaction directly.

  ### Solution

  Remove the event update logic in the SSO registration API and call the `PUT /api/interaction/event` API to update the event.
  This will ensure the correct event is triggered in the hook middleware.

  ### Action Items

  Align the current interaction API design for now.
  Need to improve the session/interaction API logic to simplify the whole process.

- b4b8015db: fix a bug that prevents invitee from accepting the organization invitation if the email letter case is not matching
- b575f57ac: Support comma separated resource parameter

  Some third-party libraries or plugins do not support array of resources, and can only specify `resource` through `additionalParameters` config, e.g. `flutter-appauth`. However, only one resource can be specified at a time in this way. This PR enables comma separated resource parameter support in Logto core service, so that multiple resources can be specified via a single string.

  For example: Auth URL like `/oidc/auth?resource=https://example.com/api1,https://example.com/api2` will be interpreted and parsed to Logto core service as `/ordc/auth?resource=https://example.com/api1&resource=https://example.com/api2`.

- aacbebcbc: Provide management API to fetch user organization scopes based on user organization roles

  - GET `organizations/:id/users/:userId/scopes`

- 3486b12e8: Fix file upload API.

  The `koa-body` has been upgraded to the latest version, which caused the file upload API to break. This change fixes the issue.

  The `ctx.request.files.file` in the new version is an array, so the code has been updated to pick the first one.

- ead2abde6: fix a bug that API resource indicator does not work if the indicator is not followed by a trailing slash or a pathname

  - Bump `oidc-provider@8.4.6` to fix the above issue

- Updated dependencies [21bb35b12]
- Updated dependencies [5b03030de]
- Updated dependencies [b80934ac5]
- Updated dependencies [a9ccfc738]
- Updated dependencies [e8c41b164]
- Updated dependencies [5872172cb]
- Updated dependencies [6fe6f87bc]
- Updated dependencies [21bb35b12]
- Updated dependencies [bbd399e15]
- Updated dependencies [3486b12e8]
- Updated dependencies [9cf03c8ed]
- Updated dependencies [c1c746bca]
  - @logto/schemas@1.16.0
  - @logto/console@1.14.0
  - @logto/phrases@1.10.1
  - @logto/experience@1.6.1
  - @logto/app-insights@2.0.0
  - @logto/shared@3.1.1
  - @logto/cli@1.16.0

## 1.15.0

### Minor Changes

- 172411946: Add avatar and customData fields to create user API (POST /api/users)
- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

- 2cbc591ff: support `first_screen` parameter in authentication request

  Sign-in experience can be initiated with a specific screen by setting the `first_screen` parameter in the OIDC authentication request. This parameter is intended to replace the `interaction_mode` parameter, which is now deprecated.

  The `first_screen` parameter can have the following values:

  - `signIn`: The sign-in screen is displayed first.
  - `register`: The registration screen is displayed first.

  Here's a non-normative example of how to use the `first_screen` parameter:

  ```
  GET /authorize?
    response_type=code
    &client_id=your_client_id
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
    &scope=openid
    &state=af0ifjsldkj
    &nonce=n-0S6_WzA2Mj
    &first_screen=signIn
  ```

  When `first_screen` is set, the legacy `interaction_mode` parameter is ignored.

- 468558721: Get organization roles with search keyword.
- cc01acbd0: Create a new user through API with password digest and corresponding algorithm
- 2cbc591ff: support direct sign-in

  Instead of showing a screen for the user to choose between the sign-in methods, a specific sign-in method can be initiated directly by setting the `direct_sign_in` parameter in the OIDC authentication request.

  This parameter follows the format of `direct_sign_in=<method>:<target>`, where:

  - `<method>` is the sign-in method to trigger. Currently the only supported value is `social`.
  - `<target>` is the target value for the sign-in method. If the method is `social`, the value is the social connector's `target`.

  When a valid `direct_sign_in` parameter is set, the first screen will be skipped and the specified sign-in method will be triggered immediately upon entering the sign-in experience. If the parameter is invalid, the default behavior of showing the first screen will be used.

### Patch Changes

- 7c22c50cb: Fix SSO connector new user authentication internal server error.

  ## Description

  Thanks to the [issue](https://github.com/logto-io/logto/issues/5502) report, we found that the SSO connector new user authentication was causing an internal server error. Should return an 422 status code instead of 500. Frontend sign-in page can not handle the 500 error and complete the new user registration process.

  ### Root cause

  When the SSO connector returns a new user that does not exist in the Logto database, the backend with throw a 422 error. Frontend relies the 422 error to redirect and complete the new user registration process.

  However, the backend was throwing a 500 error instead. That is because we applied a strict API response status code guard at the koaGuard middleware level. The status code 422 was not listed. Therefore, the middleware threw a 500 error.

  ### Solution

  We added the 422 status code to the koaGuard middleware. Now, the backend will return a 422 status code when the SSO connector returns a new user that does not exist in the Logto database. The frontend sign-in page can handle the 422 error and complete the new user registration process.

- Updated dependencies [5758f84f5]
- Updated dependencies [57d97a4df]
- Updated dependencies [7756f50f8]
- Updated dependencies [abffb9f95]
- Updated dependencies [746483c49]
- Updated dependencies [2cbc591ff]
- Updated dependencies [57d97a4df]
- Updated dependencies [cc01acbd0]
- Updated dependencies [2cbc591ff]
- Updated dependencies [951865859]
- Updated dependencies [5a7204571]
- Updated dependencies [2cbc591ff]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/console@1.13.0
  - @logto/phrases@1.10.0
  - @logto/connector-kit@3.0.0
  - @logto/experience@1.6.0
  - @logto/core-kit@2.4.0
  - @logto/schemas@1.15.0
  - @logto/phrases-experience@1.6.1
  - @logto/demo-app@1.2.0
  - @logto/cli@1.15.0
  - @logto/shared@3.1.0

## 1.14.0

### Minor Changes

- 532454b92: support form post callback for social connectors

  Add the `POST /callback/:connectorId` endpoint to handle the form post callback for social connectors. This usefull for the connectors that require a form post callback to complete the authentication process, such as Apple.

### Patch Changes

- @logto/schemas@1.14.0
- @logto/cli@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies [677054a24]
  - @logto/console@1.12.1
  - @logto/schemas@1.13.1
  - @logto/cli@1.13.1

## 1.13.0

### Minor Changes

- 32df9acde: implement Logto core API to support the new third-party application feature, and user consent interaction flow

  ### Management API

  - Add new endpoint `/applications/sign-in-experiences` with `PUT`, `GET` methods to manage the application level sign-in experiences.
  - Add new endpoint `/applications/:id/users/:userId/consent-organizations` with `PUT`, `GET`, `POST`, `DELETE` methods to manage the user granted organizations for the third-party application.
  - Add new endpoint `/applications/:id/user-consent-scopes` with `GET`, `POST`, `DELETE` methods to manage the user consent resource, organization, and user scopes for the third-party application.
  - Update the `/applications` endpoint to include the new `is_third_party` field. Support create third-party applications, and query by `is_third_party` field.

  ### Interaction API

  - Add the `koaAutoConsent` to support the auto-consent interaction flow for the first-party application. If is the first-party application we can auto-consent the requested scopes. If is the third-party application we need to redirect the user to the consent page to get the user consent manually.
  - Add the `GET /interaction/consent` endpoint to support fetching the consent context for the user consent page. Including the application detail, authenticated user info, all the requested scopes and user organizations info (if requested scopes include the organization scope).
  - Update the `POST /interaction/consent` endpoint to support the user consent interaction flow. Including grant all the missing scopes, and update the user granted organizations for the third-party application.

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9222eb9f8: Set `on conflict do nothing` for all the `RelationQueries` insert operation.

  - For all the relation table entities, we want to safely insert them into the database. If the relation entity already exists, instead of throwing an error, we ignore the insert operation, especially on a batch insert. Unlike other resource data entities, user does not care if the relation entity already exists. Therefore, we want to silently ignore the insert operation if the relation entity already exists.

- acb7fd3fe: Add case sensitive username env variable
- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [a2ce0be46]
- Updated dependencies [e4c73e7bb]
- Updated dependencies [acb7fd3fe]
- Updated dependencies [32df9acde]
- Updated dependencies [9089dbf84]
- Updated dependencies [c14cd1827]
- Updated dependencies [b40bae9c5]
- Updated dependencies [32df9acde]
- Updated dependencies [04ec78a91]
- Updated dependencies [32df9acde]
- Updated dependencies [715dba2ce]
- Updated dependencies [31e60811d]
- Updated dependencies [8c4bfbce1]
- Updated dependencies [32df9acde]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/schemas@1.13.0
  - @logto/cli@1.13.0
  - @logto/shared@3.1.0
  - @logto/experience@1.5.0
  - @logto/connector-kit@2.1.0
  - @logto/language-kit@1.1.0
  - @logto/phrases-experience@1.6.0
  - @logto/core-kit@2.3.0
  - @logto/app-insights@1.4.0
  - @logto/demo-app@1.1.0
  - @logto/console@1.12.0
  - @logto/phrases@1.9.0

## 1.12.0

### Minor Changes

- 9a7b19e49: Support single sign-on (SSO) on Logto.

  - Implement new SSO connector management APIs.

    - `GET /api/sso-connector-providers` - List all the supported SSO connector providers.
    - `POST /api/sso-connectors` - Create new SSO connector.
    - `GET /api/sso-connectors` - List all the SSO connectors.
    - `GET /api/sso-connectors/:id` - Get SSO connector by id.
    - `PATCH /api/sso-connectors/:id` - Update SSO connector by id.
    - `DELETE /api/sso-connectors/:id` - Delete SSO connector by id.

  - Implement new SSO interaction APIs to enable the SSO connector sign-in methods

    - `POST /api/interaction/single-sign-on/:connectorId/authorization-url` - Init a new SSO connector sign-in interaction flow by retrieving the IdP's authorization URL.
    - `POST /api/interaction/single-sign-on/:connectorId/authentication` - Handle the SSO connector sign-in interaction flow by retrieving the IdP's authentication data.
    - `POST /api/interaction/single-sign-on/:connectorId/registration` - Create new user account by using the SSO IdP's authentication result.
    - `GET /api/interaction/single-sign-on/connectors` - List all the enabled SSO connectors by a given email address.

  - Implement new SSO connector factory to support different SSO connector providers.
    - `OIDC` - Standard OIDC connector that can be used to connect with any OIDC compatible IdP.
    - `SAML` - Standard SAML 2.0 connector that can be used to connect with any SAML 2.0 compatible IdP.
    - `AzureAD` - Azure Active Directory connector that can be used to connect with Azure AD.
    - `Okta` - Okta connector that can be used to connect with Okta.
    - `Google Workspace` - Google Workspace connector that can be used to connect with Google Workspace.

- becf59169: introduce Logto Organizations

  The term "organization" is also used in other forms, such as "workspace", "team", "company", etc. In Logto, we use "organization" as the generic term to represent the concept of multi-tenancy.

  From now, you can create multiple organizations in Logto, each of which can have its own users, while in the same identity pool.

  Plus, we also introduce the concept of "organization template". It is a set of permissions and roles that applies to all organizations, while a user can have different roles in different organizations.

  See [🏢 Organizations (Multi-tenancy)](https://docs.logto.io/docs/recipes/organizations/) for more details.

### Patch Changes

- b05fb2960: add summary and description to APIs
- 9a4da065d: fix incorrect swagger components
- b4f702a86: userinfo endpoint will return `organization_data` claim if organization scope is requested

  The claim includes all organizations that the user is a member of with the following structure:

  ```json
  {
    "organization_data": [
      {
        "id": "organization_id",
        "name": "organization_name",
        "description": "organization_description"
      }
    ]
  }
  ```

- 3e92a2032: refactor: add user ip to webhook event payload
- Updated dependencies [9a7b19e49]
- Updated dependencies [9a7b19e49]
- Updated dependencies [4b90782ae]
- Updated dependencies [9a7b19e49]
- Updated dependencies [9421375d7]
- Updated dependencies [becf59169]
- Updated dependencies [b4f702a86]
- Updated dependencies [3e92a2032]
- Updated dependencies [9a7b19e49]
- Updated dependencies [9a7b19e49]
  - @logto/experience@1.4.0
  - @logto/phrases@1.8.0
  - @logto/cli@1.12.0
  - @logto/console@1.11.0
  - @logto/core-kit@2.2.1
  - @logto/schemas@1.12.0
  - @logto/phrases-experience@1.5.0

## 1.11.0

### Minor Changes

- 6727f629d: feature: introduce multi-factor authentication

  We're excited to announce that Logto now supports multi-factor authentication (MFA) for your sign-in experience. Navigate to the "Multi-factor auth" tab to configure how you want to secure your users' accounts.

  In this release, we introduce the following MFA methods:

  - Authenticator app OTP: users can add any authenticator app that supports the TOTP standard, such as Google Authenticator, Duo, etc.
  - WebAuthn (Passkey): users can use the standard WebAuthn protocol to register a hardware security key, such as biometric keys, Yubikey, etc.
  - Backup codes：users can generate a set of backup codes to use when they don't have access to other MFA methods.

  For a smooth transition, we also support to configure the MFA policy to require MFA for sign-in experience, or to allow users to opt-in to MFA.

### Patch Changes

- bbe7f0b8e: refactored swagger json api

  - reuse parameter definitions, which reduces the size of the swagger response.
  - tags are now in sentence case.
  - path parameters now follow the swagger convention, using `{foo}` instead of `:foo`.

- Updated dependencies [6727f629d]
  - @logto/console@1.10.0
  - @logto/experience@1.3.0
  - @logto/phrases@1.7.0
  - @logto/phrases-experience@1.4.0
  - @logto/schemas@1.11.0
  - @logto/cli@1.11.0

## 1.10.1

### Patch Changes

- 46d0d4c0b: convert private signing key type from string to JSON object, in order to provide additional information such as key ID and creation timestamp.
- 1ab39d19b: fix 500 error when using search component in console to filter both roles and applications.
- Updated dependencies [46d0d4c0b]
- Updated dependencies [1ab39d19b]
- Updated dependencies [87df417d1]
- Updated dependencies [d24aaedf5]
  - @logto/schemas@1.10.1
  - @logto/cli@1.10.1
  - @logto/console@1.9.0
  - @logto/phrases@1.6.0
  - @logto/connector-kit@2.0.0
  - @logto/experience@1.2.1
  - @logto/shared@3.0.0

## 1.10.0

### Minor Changes

- 03bc7888b: machine-to-machine (M2M) role-based access control (RBAC)

  ### Summary

  This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

  With the update, Logto users can now effectively manage permissions for their M2M applications, resulting in improved security and flexibility.

  Following new APIs are added for M2M role management:

  **Applications**

  - `POST /applications/:appId/roles` assigns role(s) to the M2M application
  - `DELETE /applications/:appId/roles/:roleId` deletes the role from the M2M application
  - `GET /applications/:appId/roles` lists all roles assigned to the M2M application

  **Roles**

  - `POST /roles/:roleId/applications` assigns the role to multiple M2M applications
  - `DELETE /roles/:roleId/applications/:appId` removes the M2M application assigned to the role
  - `GET /roles/:roleId/applications` lists all M2M applications granted with the role

  Updated following API:

  **Roles**

  - `POST /roles` to specify the role type (either `user` or `machine-to-machine` role)

  **Users**

  - `POST /users/:userId/roles` to prevent assigning M2M roles to end-users

- 2c340d379: support `roles` scope for ID token to issue `roles` claim

### Patch Changes

- Updated dependencies [2c340d379]
  - @logto/core-kit@2.2.0
  - @logto/schemas@1.10.0
  - @logto/cli@1.10.0

## 1.9.2

### Patch Changes

- 18181f892: standardize id and secret generators

  - Remove `buildIdGenerator` export from `@logto/shared`
  - Add `generateStandardSecret` and `generateStandardShortId` exports to `@logto/shared`
  - Align comment and implementation of `buildIdGenerator` in `@logto/shared`
    - The comment stated the function will include uppercase letters by default, but it did not; Now it does.
  - Use `generateStandardSecret` for all secret generation

- 827123faa: block an identifier from verification for 10 minutes after 5 failed attempts within 1 hour
- Updated dependencies [a8b5a020f]
- Updated dependencies [18181f892]
  - @logto/console@1.8.0
  - @logto/shared@3.0.0
  - @logto/schemas@1.9.2
  - @logto/cli@1.9.2
  - @logto/core-kit@2.1.2

## 1.9.1

### Patch Changes

- Updated dependencies [a4b44dde5]
- Updated dependencies [6f5a0acad]
  - @logto/console@1.7.1
  - @logto/phrases-experience@1.3.1
  - @logto/core-kit@2.1.1
  - @logto/experience@1.2.1
  - @logto/schemas@1.9.1
  - @logto/cli@1.9.1

## 1.9.0

### Minor Changes

- e8b0b1d02: feature: password policy

  ### Summary

  This feature enables custom password policy for users. Now it is possible to guard with the following rules when a user is creating a new password:

  - Minimum length (default: `8`)
  - Minimum character types (default: `1`)
  - If the password has been pwned (default: `true`)
  - If the password is exactly the same as or made up of the restricted phrases:
    - Repetitive or sequential characters (default: `true`)
    - User information (default: `true`)
    - Custom words (default: `[]`)

  If you are an existing Logto Cloud user or upgrading from a previous version, to ensure a smooth experience, we'll keep the original policy as much as possible:

  > The original password policy requires a minimum length of 8 and at least 2 character types (letters, numbers, and symbols).

  Note in the new policy implementation, it is not possible to combine lower and upper case letters into one character type. So the original password policy will be translated into the following:

  - Minimum length: `8`
  - Minimum character types: `2`
  - Pwned: `false`
  - Repetitive or sequential characters: `false`
  - User information: `false`
  - Custom words: `[]`

  If you want to change the policy, you can do it:

  - Logto Console -> Sign-in experience -> Password policy.
  - Update `passwordPolicy` property in the sign-in experience via Management API.

  ### Side effects

  - All new users will be affected by the new policy immediately.
  - Existing users will not be affected by the new policy until they change their password.
  - We removed password restrictions when adding or updating a user via Management API.

- 17fd64e64: Support region option for s3 storage

### Patch Changes

- f8408fa77: rename the package `phrases-ui` to `phrases-experience`
- f6723d5e2: rename the package `ui` to `experience`
- Updated dependencies [e8b0b1d02]
- Updated dependencies [daf9674b6]
- Updated dependencies [f8408fa77]
- Updated dependencies [17fd64e64]
- Updated dependencies [18e05586c]
- Updated dependencies [f6723d5e2]
- Updated dependencies [310698b0d]
- Updated dependencies [5d78c7271]
  - @logto/schemas@1.9.0
  - @logto/console@1.7.0
  - @logto/phrases@1.5.0
  - @logto/phrases-experience@1.3.0
  - @logto/core-kit@2.1.0
  - @logto/experience@1.2.0
  - @logto/cli@1.9.0
  - @logto/shared@2.0.1

## 1.8.0

### Patch Changes

- 0b519e548: allow non-http origins for application CORS
- Updated dependencies [0b519e548]
- Updated dependencies [d90b4e7f6]
- Updated dependencies [ae0ef919f]
  - @logto/console@1.6.0
  - @logto/schemas@1.8.0
  - @logto/cli@1.8.0

## 1.7.0

### Minor Changes

- 5ccdd7f31: Record daily active users

### Patch Changes

- Updated dependencies [16d83dd2f]
- Updated dependencies [5ccdd7f31]
- Updated dependencies [fde330a8b]
  - @logto/console@1.5.1
  - @logto/schemas@1.7.0
  - @logto/cli@1.7.0

## 1.6.0

### Minor Changes

- ecbecd8e4: various application improvements

  - Show OpenID Provider configuration endpoint in Console
  - Configure "Rotate Refresh Token" in Console
  - Configure "Refresh Token TTL" in Console

### Patch Changes

- Updated dependencies [ecbecd8e4]
- Updated dependencies [e9c2c9a6d]
- Updated dependencies [c743cef42]
- Updated dependencies [ecbecd8e4]
- Updated dependencies [cfe4fce51]
  - @logto/cli@1.6.0
  - @logto/core-kit@2.0.1
  - @logto/ui@1.1.5
  - @logto/console@1.5.0
  - @logto/schemas@1.6.0
  - @logto/phrases@1.4.1
  - @logto/app-insights@1.3.1

## 1.5.0

### Minor Changes

- 73666f8fa: Provide new features for webhooks

  ## Features

  - Manage webhooks via the Admin Console
  - Securing webhooks by validating signature
  - Allow to enable/disable a webhook
  - Track recent execution status of a webhook
  - Support multi-events for a webhook

  ## Updates

  - schemas: add `name`, `events`, `signingKey`, and `enabled` fields to the `hook` schema
  - core: change the `user-agent` value from `Logto (https://logto.io)` to `Logto (https://logto.io/)` in the webhook request headers
  - core: deprecate `event` field in all hook-related APIs, use `events` instead
  - core: deprecate `retries` field in the `HookConfig` for all hook-related APIs, now it will fallback to `3` if not specified and will be removed in the future
  - core: add new APIs for webhook management
    - `GET /api/hooks/:id/recent-logs` to retrieve recent execution logs(24h) of a webhook
    - `POST /api/hooks/:id/test` to test a webhook
    - `PATCH /api/hooks/:id/signing-key` to regenerate the signing key of a webhook
  - core: support query webhook execution stats(24h) via `GET /api/hooks/:id` and `GET /api/hooks/:id` by specifying `includeExecutionStats` query parameter
  - console: support webhook management

- 268dc50e7: Support setting default API Resource from Console and API

  - New API Resources will not be treated as default.
  - Added `PATCH /resources/:id/is-default` to setting `isDefault` for an API Resource.
    - Only one default API Resource is allowed per tenant. Setting one API default will reset all others.

- fa0dbafe8: Add custom domain support

### Patch Changes

- ac65c8de4: ### Enable strict CSP policy check header

  This change removes the report only flag from CSP security header settings, which will enables the strict CSP policy check for all requests.

- 3d9885233: ## Bump oidc-provider version

  Bump oidc-provider version to [v8.2.2](https://github.com/panva/node-oidc-provider/releases/tag/v8.2.2). This version fixes a bug that prevented the revoked scopes from being removed from the access token.

  > Issued Access Tokens always only contain scopes that are defined on the respective Resource Server (returned from features.resourceIndicators.getResourceServerInfo).

  If the scopes are revoked from the resource server, they should be removed from the newly granted access token. This is now fixed in the new version of oidc-provider.

- 813e21639: Bug fix: reset password webhook should be triggered when the user resets password
- Updated dependencies [2cab3787c]
- Updated dependencies [73666f8fa]
- Updated dependencies [268dc50e7]
- Updated dependencies [fa0dbafe8]
- Updated dependencies [497d5b526]
  - @logto/schemas@1.5.0
  - @logto/console@1.4.0
  - @logto/phrases@1.4.0
  - @logto/cli@1.5.0

## 1.4.0

### Minor Changes

- 9a3aa3aae: Automatically sync the trusted social email and phone info to the new registered user profile
- 5d6720805: add config `alwaysIssueRefreshToken` for web apps to unblock OAuth integrations that are not strictly conform OpenID Connect.

  when it's enabled, Refresh Tokens will be always issued regardless if `prompt=consent` was present in the authorization request.

### Patch Changes

- 5d6720805: parse requests with `application/json` content-type for `/oidc` APIs to increase compatibility
- Updated dependencies [5d6720805]
- Updated dependencies [5d6720805]
  - @logto/cli@1.4.0
  - @logto/console@1.3.0
  - @logto/phrases@1.3.0
  - @logto/schemas@1.4.0

## 1.3.1

### Patch Changes

- 5a59cd38e: Disable pkce requirement for traditional web app
  - @logto/schemas@1.3.1
  - @logto/cli@1.3.1

## 1.3.0

### Minor Changes

- 0023dfe38: Provide management APIs to help link social identities to user

  - POST `/users/:userId/identities` to link a social identity to a user
  - POST `/connectors/:connectorId/authorization-uri` to get the authorization URI for a connector

### Patch Changes

- 1642df7e1: add response schemas to swagger.json API
- Updated dependencies [a65bc9b13]
- Updated dependencies [beb6ebad5]
  - @logto/console@1.2.4
  - @logto/schemas@1.3.0
  - @logto/cli@1.3.0

## 1.2.3

### Patch Changes

- 046a5771b: upgrade i18next series packages (#3733, #3743)
- Updated dependencies [046a5771b]
  - @logto/console@1.2.3
  - @logto/demo-app@1.0.1
  - @logto/ui@1.1.4
  - @logto/schemas@1.2.3
  - @logto/cli@1.2.3

## 1.2.2

### Patch Changes

- Updated dependencies [4331deb6f]
- Updated dependencies [748878ce5]
  - @logto/app-insights@1.2.0
  - @logto/console@1.2.2
  - @logto/ui@1.1.3
  - @logto/schemas@1.2.2
  - @logto/cli@1.2.2

## 1.2.1

### Patch Changes

- Updated dependencies [352807b16]
  - @logto/app-insights@1.1.0
  - @logto/console@1.2.1
  - @logto/ui@1.1.2
  - @logto/schemas@1.2.1
  - @logto/cli@1.2.1

## 1.2.0

### Minor Changes

- 1548e0732: implement a central cache store to cache well-known with Redis implementation

### Patch Changes

- 7af8e9c9b: Add new management API `/users/:userId/password/verify` to help verify user password, which would be helpful when building custom profile or sign-in pages
- 6b1948592: Provide management API to detect if a user has set the password.
- 4945b0be2: Apply security headers

  Apply security headers to logto http request response using (helmetjs)[https://helmetjs.github.io/].

  - [x] crossOriginOpenerPolicy
  - [x] crossOriginEmbedderPolicy
  - [x] crossOriginResourcePolicy
  - [x] hidePoweredBy
  - [x] hsts
  - [x] ieNoOpen
  - [x] noSniff
  - [x] referrerPolicy
  - [x] xssFilter
  - [x] Content-Security-Policy

- Updated dependencies [6cbc90389]
- Updated dependencies [3c84d81ff]
- Updated dependencies [ae6a54993]
- Updated dependencies [206fba2b5]
- Updated dependencies [457cb2822]
- Updated dependencies [736d6d212]
- Updated dependencies [4945b0be2]
- Updated dependencies [c5eb3a2ba]
- Updated dependencies [5553425fc]
- Updated dependencies [30033421c]
- Updated dependencies [91906f0eb]
  - @logto/console@1.2.0
  - @logto/cli@1.2.0
  - @logto/phrases@1.2.0
  - @logto/phrases-ui@1.2.0
  - @logto/schemas@1.2.0
  - @logto/shared@2.0.0
  - @logto/ui@1.1.1
  - @logto/core-kit@2.0.0
  - @logto/connector-kit@1.1.1
  - @logto/demo-app@1.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [f9ca7cc49]
- Updated dependencies [37714d153]
- Updated dependencies [f3d60a516]
- Updated dependencies [5c50957a9]
- Updated dependencies [e9e8a6e11]
- Updated dependencies [e2ec1f93e]
  - @logto/phrases@1.1.0
  - @logto/phrases-ui@1.1.0
  - @logto/cli@1.1.0
  - @logto/schemas@1.1.0
  - @logto/shared@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [5b4da1e3d]
  - @logto/schemas@1.0.7
  - @logto/cli@1.0.3
  - @logto/shared@1.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [621b09ba1]
  - @logto/schemas@1.0.1
  - @logto/cli@1.0.2
  - @logto/shared@1.0.1

## 1.0.1

### Patch Changes

- 03ac35e75: fix applications_roles query
  - @logto/cli@1.0.1

## 1.0.0

### Major Changes

- c12717412: **Decouple users and admins**

  ## 💥 BREAKING CHANGES 💥

  Logto was using a single port to serve both normal users and admins, as well as the web console. While we continuously maintain a high level of security, it’ll still be great to decouple these components into two separate parts to keep data isolated and provide a flexible infrastructure.

  From this version, Logto now listens to two ports by default, one for normal users (`3001`), and one for admins (`3002`).

  - Nothing changed for normal users. No adaption is needed.
  - For admin users:
    - The default Admin Console URL has been changed to `http://localhost:3002/console`.
    - To change the admin port, set the environment variable `ADMIN_PORT`. For instance, `ADMIN_PORT=3456`.
    - You can specify a custom endpoint for admins by setting the environment variable `ADMIN_ENDPOINT`. For example, `ADMIN_ENDPOINT=https://admin.your-domain.com`.
    - You can now completely disable admin endpoints by setting `ADMIN_DISABLE_LOCALHOST=1` and leaving `ADMIN_ENDPOINT` unset.
    - Admin Console and admin user data are not accessible via normal user endpoints, including `localhost` and `ENDPOINT` from the environment.
    - Admin Console no longer displays audit logs of admin users. However, these logs still exist in the database, and Logto still inserts admin user logs. There is just no convenient interface to inspect them.
    - Due to the data isolation, the numbers on the dashboard may slightly decrease (admins are excluded).

  If you are upgrading from a previous version, simply run the database alteration command as usual, and we'll take care of the rest.

  > **Note** DID YOU KNOW
  >
  > Under the hood, we use the powerful Postgres feature Row-Level Security to isolate admin and user data.

- 1c9160112: Packages are now ESM.
- 343b1090f: **💥 BREAKING CHANGE 💥** Move `/api/phrase` API to `/api/.well-known/phrases`
- f41fd3f05: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- c12717412: - mask sensitive password value in audit logs
- f41fd3f05: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- c12717412: ## Enable connector method `getUserInfo` read and write access to DB

  Logto connectors are designed to be stateless to the extent possible and practical, but it still has some exceptions at times.

  With the recent addition of database read and write access, connectors can now store persistent information. For example, connectors can now store access tokens and refresh tokens to minimize number of requests to social vendor's APIs.

- 343b1090f: - Automatically create a new tenant for new cloud users
  - Support path-based multi-tenancy
- 343b1090f: Add storage provider: S3Storage
- 343b1090f: Allow admin tenant admin to create tenants without limitation
- 343b1090f: ### Add privacy policy url

  In addition to the terms of service url, we also provide a privacy policy url field in the sign-in-experience settings. To better support the end-users' privacy declaration needs.

- 18e3b82e6: Add user suspend API endpoint

  Use `PATCH /api/users/:userId/is-suspended` to update a user's suspended state, once a user is suspended, all refresh tokens belong to this user will be revoked.

  Suspended users will get an error toast when trying to sign in.

- 343b1090f: Add API for uploading user images to storage providers: Azure Storage.
- f41fd3f05: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- 343b1090f: **Add `sessionNotFoundRedirectUrl` tenant config**

  - User can use this optional config to designate the URL to redirect if session not found in Sign-in Experience.
  - Session guard now works for root path as well.

- 343b1090f: New feature: User account settings page

  - We have removed the previous settings page and moved it to the account settings page. You can access to the new settings menu by clicking the user avatar in the top right corner.
  - You can directly change the language or theme from the popover menu, and explore more account settings by clicking the "Profile" menu item.
  - You can update your avatar, name and username in the profile page, and also changing your password.
  - [Cloud] Cloud users can also link their email address and social accounts (Google and GitHub at first launch).

- 343b1090f: remove the branding style config and make the logo URL config optional
- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

- 2168936b9: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- 1c9160112: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

- f41fd3f05: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys
- 343b1090f: ### Add custom content sign-in-experience settings to allow insert custom static html content to the logto sign-in pages

  - feat: combine with the custom css, give the user the ability to further customize the sign-in pages

- fdb2bb48e: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f05: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.
- 402866994: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

- f41fd3f05: Add support to send and verify verification code in management APIs

### Patch Changes

- e63f5f8b0: Bump connector kit version to fix "Continue" issues on sending email/sms.
- 51f527b0c: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow

- 343b1090f: ## Refactor the Admin Console 403 flow

  - Add 403 error handler for all AC API requests
  - Show confirm modal to notify the user who is not authorized
  - Click `confirm` button to sign out and redirect user to the sign-in page

- 343b1090f: Add interactionMode extra OIDC params to specify the desired use interaction experience

  - signUp: Deliver a sign-up first interaction experience
  - signIn & undefined: Deliver a default sign-in first interaction experience

- 38970fb88: Fix a Sign-in experience bug that may block some users to sign in.
- 343b1090f: **Seed data for cloud**

  - cli!: remove `oidc` option for `database seed` command as it's unused
  - cli: add hidden `--cloud` option for `database seed` command to init cloud data
  - cli, cloud: appending Redirect URIs to Admin Console will deduplicate values before update
  - move `UrlSet` and `GlobalValues` to `@logto/shared`

- 5e1466f40: Allow localhost CORS when only one endpoint available
- Updated dependencies [343b1090f]
- Updated dependencies [f41fd3f05]
- Updated dependencies [e63f5f8b0]
- Updated dependencies [f41fd3f05]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [68f2d56a2]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [38970fb88]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [c12717412]
- Updated dependencies [343b1090f]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [343b1090f]
- Updated dependencies [1c9160112]
- Updated dependencies [f41fd3f05]
- Updated dependencies [7fb689b73]
- Updated dependencies [1c9160112]
- Updated dependencies [343b1090f]
- Updated dependencies [f41fd3f05]
- Updated dependencies [f41fd3f05]
- Updated dependencies [2d45cc3e6]
- Updated dependencies [3ff2e90cd]
  - @logto/schemas@1.0.0
  - @logto/shared@1.0.0
  - @logto/cli@1.0.0
  - @logto/phrases-ui@1.0.0
  - @logto/phrases@1.0.0
  - @logto/connector-kit@1.1.0
  - @logto/core-kit@1.1.0

## 1.0.0-rc.3

### Patch Changes

- 5e1466f40: Allow localhost CORS when only one endpoint available
  - @logto/cli@1.0.0-rc.3

## 1.0.0-rc.2

### Major Changes

- c12717412: **Decouple users and admins**

  ## 💥 BREAKING CHANGES 💥

  Logto was using a single port to serve both normal users and admins, as well as the web console. While we continuously maintain a high level of security, it’ll still be great to decouple these components into two separate parts to keep data isolated and provide a flexible infrastructure.

  From this version, Logto now listens to two ports by default, one for normal users (`3001`), and one for admins (`3002`).

  - Nothing changed for normal users. No adaption is needed.
  - For admin users:
    - The default Admin Console URL has been changed to `http://localhost:3002/console`.
    - To change the admin port, set the environment variable `ADMIN_PORT`. For instance, `ADMIN_PORT=3456`.
    - You can specify a custom endpoint for admins by setting the environment variable `ADMIN_ENDPOINT`. For example, `ADMIN_ENDPOINT=https://admin.your-domain.com`.
    - You can now completely disable admin endpoints by setting `ADMIN_DISABLE_LOCALHOST=1` and leaving `ADMIN_ENDPOINT` unset.
    - Admin Console and admin user data are not accessible via normal user endpoints, including `localhost` and `ENDPOINT` from the environment.
    - Admin Console no longer displays audit logs of admin users. However, these logs still exist in the database, and Logto still inserts admin user logs. There is just no convenient interface to inspect them.
    - Due to the data isolation, the numbers on the dashboard may slightly decrease (admins are excluded).

  If you are upgrading from a previous version, simply run the database alteration command as usual, and we'll take care of the rest.

  > **Note** DID YOU KNOW
  >
  > Under the hood, we use the powerful Postgres feature Row-Level Security to isolate admin and user data.

### Minor Changes

- c12717412: - mask sensitive password value in audit logs
- c12717412: ## Creating your social connector with ease

  We’re excited to announce that Logto now supports standard protocols (SAML, OIDC, and OAuth2.0) for creating social connectors to integrate external identity providers. Each protocol can create multiple social connectors, giving you more control over your access needs.

  To simplify the process of configuring social connectors, we’re replacing code-edit with simple forms. SAML already supports form configuration, with other connectors coming soon. This means you don’t need to compare documents or worry about code format.

- c12717412: ## Enable connector method `getUserInfo` read and write access to DB

  Logto connectors are designed to be stateless to the extent possible and practical, but it still has some exceptions at times.

  With the recent addition of database read and write access, connectors can now store persistent information. For example, connectors can now store access tokens and refresh tokens to minimize number of requests to social vendor's APIs.

- c12717412: **Customize CSS for Sign-in Experience**

  We have put a lot of effort into improving the user sign-in experience and have provided a brand color option for the UI. However, we know that fine-tuning UI requirements can be unpredictable. While Logto is still exploring the best options for customization, we want to provide a programmatic method to unblock your development.

  You can now use the Management API `PATCH /api/sign-in-exp` with body `{ "customCss": "arbitrary string" }` to set customized CSS for the sign-in experience. You should see the value of `customCss` attached after `<title>` of the page. If the style has a higher priority, it should be able to override.

  > **Note**
  >
  > Since Logto uses CSS Modules, you may see a hash value in the `class` property of DOM elements (e.g. a `<div>` with `vUugRG_container`). To override these, you can use the `$=` CSS selector to match elements that end with a specified value. In this case, it should be `div[class$=container]`.

### Patch Changes

- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
- Updated dependencies [c12717412]
  - @logto/phrases@1.0.0-rc.1
  - @logto/phrases-ui@1.0.0-rc.1
  - @logto/schemas@1.0.0-rc.1
  - @logto/cli@1.0.0-rc.2
  - @logto/shared@1.0.0-rc.1

## 1.0.0-rc.1

### Patch Changes

- 51f527b0: bug fixes

  - core: fix 500 error when enabling app admin access in console
  - ui: handle required profile errors on social binding flow
  - @logto/cli@1.0.0-rc.1

## 1.0.0-rc.0

### Major Changes

- f41fd3f0: drop settings table and add systems table

  **BREAKING CHANGES**

  - core: removed `GET /settings` and `PATCH /settings` API
  - core: added `GET /configs/admin-console` and `PATCH /configs/admin-console` API
    - `/configs/*` APIs are config/key-specific now. they may have different logic per key
  - cli: change valid `logto db config` keys by removing `alterationState` and adding `adminConsole` since:
    - OIDC configs and admin console configs are tenant-level configs (the concept of "tenant" can be ignored until we officially announce it)
    - alteration state is still a system-wide config

### Minor Changes

- f41fd3f0: Replace `passcode` naming convention in the interaction APIs and main flow ui with `verificationCode`.
- f41fd3f0: Officially cleanup all deprecated `/session` APIs in core and all the related integration tests.
- f41fd3f0: - cli: use `ec` with `secp384r1` as the default key generation type
  - core: use `ES384` as the signing algorithm for EC keys
- fdb2bb48: **Streamlining the social sign-up flow**

  - detect trusted email (or phone number) from the social account
    - email (or phone number) has been registered: automatically connecting the social identity to the existing user account with a single click
    - email (or phone number) not registered: automatically sync up the user profile with the social provided email (or phone) if and only if marked as a required user profile.

- f41fd3f0: Replace the `sms` naming convention using `phone` cross logto codebase. Including Sign-in Experience types, API paths, API payload and internal variable names.
- f41fd3f0: Add support to send and verify verification code in management APIs

### Patch Changes

- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
- Updated dependencies [f41fd3f0]
  - @logto/cli@1.0.0-rc.0
  - @logto/schemas@1.0.0-rc.0
  - @logto/shared@1.0.0-rc.0

## 1.0.0-beta.19

### Patch Changes

- Updated dependencies [df9e98dc]
  - @logto/cli@1.0.0-beta.19
  - @logto/schemas@1.0.0-beta.18
  - @logto/shared@1.0.0-beta.18

## 1.0.0-beta.18

### Major Changes

- 1c916011: Packages are now ESM.

### Minor Changes

- 1c916011: ### Features

  - Enhanced user search params #2639
  - Web hooks

  ### Improvements

  - Refactored Interaction APIs and Audit logs

### Patch Changes

- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
- Updated dependencies [1c916011]
  - @logto/cli@1.0.0-beta.18
  - @logto/phrases@1.0.0-beta.17
  - @logto/phrases-ui@1.0.0-beta.17
  - @logto/schemas@1.0.0-beta.17
  - @logto/shared@1.0.0-beta.17

## 1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- 38970fb8: Fix a Sign-in experience bug that may block some users to sign in.
- Updated dependencies [38970fb8]
  - @logto/cli@1.0.0-beta.16
  - @logto/phrases@1.0.0-beta.16
  - @logto/schemas@1.0.0-beta.16
  - @logto/shared@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Bump connector kit version to fix "Continue" issues on sending email/sms.
- Updated dependencies
  - @logto/schemas@1.0.0-beta.15
  - @logto/cli@1.0.0-beta.15
  - @logto/shared@1.0.0-beta.15

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [2d45cc3e]
  - @logto/schemas@1.0.0-beta.14
  - @logto/cli@1.0.0-beta.14
  - @logto/shared@1.0.0-beta.14

## 1.0.0-beta.13

### Minor Changes

- 18e3b82e: Add user suspend API endpoint

  Use `PATCH /api/users/:userId/is-suspended` to update a user's suspended state, once a user is suspended, all refresh tokens belong to this user will be revoked.

  Suspended users will get an error toast when trying to sign in.

- 2168936b: **Sign-in Experience v2**

  We are thrilled to announce the release of the newest version of the Sign-in Experience, which includes more ways to sign-in and sign-up, as well as a framework that is easier to understand and more flexible to configure in the Admin Console.

  When compared to Sign-in Experience v1, this version’s capability was expanded so that it could support a greater variety of flexible use cases. For example, now users can sign up with email verification code and sign in with email and password.

  We hope that this will be able to assist developers in delivering a successful sign-in flow, which will also be appreciated by the end users.

- 40286699: **💥 Breaking change 💥**

  Use case-insensitive strategy for searching emails

### Patch Changes

- Updated dependencies [68f2d56a]
- Updated dependencies [3ff2e90c]
  - @logto/phrases@1.0.0-beta.13
  - @logto/phrases-ui@1.0.0-beta.13
  - @logto/cli@1.0.0-beta.13
  - @logto/schemas@1.0.0-beta.13
  - @logto/shared@1.0.0-beta.13

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.12](https://github.com/logto-io/logto/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-10-19)

**Note:** Version bump only for package @logto/core

## [1.0.0-beta.11](https://github.com/logto-io/logto/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-19)

### ⚠ BREAKING CHANGES

- update scripts

### Features

- **cli:** get/set db config key ([0eff1e3](https://github.com/logto-io/logto/commit/0eff1e3591129802f3e9b3286652ef6fc8619cf5))
- **core,phrases:** add GET /phrase route ([#1959](https://github.com/logto-io/logto/issues/1959)) ([7ce55a8](https://github.com/logto-io/logto/commit/7ce55a8458166d1ca7453f3f637aed202860bf6c))

### Bug Fixes

- add redirectURI validation on frontend & backend ([#1874](https://github.com/logto-io/logto/issues/1874)) ([4b0970b](https://github.com/logto-io/logto/commit/4b0970b6d8c6647a6e68bf27fe3db3aeb635768e))
- **core:** fix deletePasscodeByIds bug ([#2049](https://github.com/logto-io/logto/issues/2049)) ([11b605a](https://github.com/logto-io/logto/commit/11b605a3e7bcef5ecbe24c5a39b8a1a081a54e88))

### Miscellaneous Chores

- update scripts ([c96495a](https://github.com/logto-io/logto/commit/c96495ad4ef778a006f0307a9e0a4bf47d0bfdc7))

## [1.0.0-beta.10](https://github.com/logto-io/logto/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-09-28)

### ⚠ BREAKING CHANGES

- **core:** update `koaAuth()` to inject detailed auth info (#1977)
- **core:** update user scopes (#1922)

### Features

- **core,phrases:** add check protected access function ([e405ef7](https://github.com/logto-io/logto/commit/e405ef7bb8fdbf01d52ef83b19350189e32a39b6))
- **core,schemas:** add phrases schema and GET /custom-phrases/:languageKey route ([#1905](https://github.com/logto-io/logto/issues/1905)) ([7242aa8](https://github.com/logto-io/logto/commit/7242aa8c2bbb70c51e9b00dd5e3aff595c3c2eff))
- **core,schemas:** migration deploy cli ([#1966](https://github.com/logto-io/logto/issues/1966)) ([7cc2f4d](https://github.com/logto-io/logto/commit/7cc2f4d14219145e562cebef41ebb3963083cc89))
- **core,schemas:** use timestamp to version migrations ([bb4bfd3](https://github.com/logto-io/logto/commit/bb4bfd3d41fdd415f68e6e13f0d4a7e8a0093933))
- **core:** add DELETE /custom-phrases/:languageKey route ([#1919](https://github.com/logto-io/logto/issues/1919)) ([c72be69](https://github.com/logto-io/logto/commit/c72be69bea639689721651b20fd559939f6c0ce6))
- **core:** add GET /custom-phrases route ([#1935](https://github.com/logto-io/logto/issues/1935)) ([5fe0cf4](https://github.com/logto-io/logto/commit/5fe0cf4257a72f96fc439132c7b5b58e07352aa3))
- **core:** add POST /session/forgot-password/{email,sms}/send-passcode ([#1963](https://github.com/logto-io/logto/issues/1963)) ([af2600d](https://github.com/logto-io/logto/commit/af2600d828bf315ce57de5813168571e7042d8de))
- **core:** add POST /session/forgot-password/{email,sms}/verify-passcode ([#1968](https://github.com/logto-io/logto/issues/1968)) ([1ea39f3](https://github.com/logto-io/logto/commit/1ea39f346367d9f300be7281a65e689bf198a65c))
- **core:** add POST /session/forgot-password/reset ([#1972](https://github.com/logto-io/logto/issues/1972)) ([acdc86c](https://github.com/logto-io/logto/commit/acdc86c8560d30a89eccb6b0f6892221ea1bc5e0))
- **core:** add PUT /custom-phrases/:languageKey route ([#1907](https://github.com/logto-io/logto/issues/1907)) ([0ae13f0](https://github.com/logto-io/logto/commit/0ae13f091b69c717cc17ed4f400f456f1737fc5c))
- **core:** add ts to interaction result ([#1917](https://github.com/logto-io/logto/issues/1917)) ([e01042c](https://github.com/logto-io/logto/commit/e01042cbcd77c486afa1ee9fc2fa5c1d2df92542))
- **core:** cannot delete custom phrase used as default language in sign-in exp ([#1951](https://github.com/logto-io/logto/issues/1951)) ([a1aef26](https://github.com/logto-io/logto/commit/a1aef26905f624569ee47e43bb3a9c9cf05b997b))
- **core:** check migration state before app start ([#1979](https://github.com/logto-io/logto/issues/1979)) ([bf1d281](https://github.com/logto-io/logto/commit/bf1d281905bcf91a09dd8330212b6db838d65344))
- **core:** deploy migration in transaction mode ([#1980](https://github.com/logto-io/logto/issues/1980)) ([9a89c1a](https://github.com/logto-io/logto/commit/9a89c1a200322c678e2b0246ed324c847e734fc6))
- **core:** machine to machine apps ([cd9c697](https://github.com/logto-io/logto/commit/cd9c6978a35d9fc3a571c7bd56c972939c49a9b5))
- **core:** save empty string as null value in DB ([#1901](https://github.com/logto-io/logto/issues/1901)) ([ecdf06e](https://github.com/logto-io/logto/commit/ecdf06ef39a177b207dc75930e96dfcf2ae12cdc))
- **core:** support base64 format `OIDC_PRIVATE_KEYS` config in `.env` file ([#1903](https://github.com/logto-io/logto/issues/1903)) ([5bdb675](https://github.com/logto-io/logto/commit/5bdb6755d2e1bf5b6a004859561d60f1103aec69))
- **core:** update migration state after db init ([f904b88](https://github.com/logto-io/logto/commit/f904b88f564110c1ed00b2fa1c7b3c1e168fc106))
- **ui:** add passwordless switch ([#1976](https://github.com/logto-io/logto/issues/1976)) ([ddb0e47](https://github.com/logto-io/logto/commit/ddb0e47950b3bd7f92af2a8a5e14b201e0a10ed7))

### Bug Fixes

- bump react sdk and essentials toolkit to support CJK characters in idToken ([2f92b43](https://github.com/logto-io/logto/commit/2f92b438644bd330fa4b8cd3698d9129ecbae282))
- **core,schemas:** move alteration types into schemas src ([#2005](https://github.com/logto-io/logto/issues/2005)) ([10c1be6](https://github.com/logto-io/logto/commit/10c1be6eb76e1cb94746aee632a421aea8d4c211))
- **core:** filter out connector-kit ([#1987](https://github.com/logto-io/logto/issues/1987)) ([f4cf89f](https://github.com/logto-io/logto/commit/f4cf89fb8deee7472d8e9bdbcb7ae7364ced1f74))
- support capital letter "Y" in command line prompt ([416f4e8](https://github.com/logto-io/logto/commit/416f4e86e390318dbb0bdb262139ca4ec72ce5fe))

### Code Refactoring

- **core:** update `koaAuth()` to inject detailed auth info ([#1977](https://github.com/logto-io/logto/issues/1977)) ([d4fc7b3](https://github.com/logto-io/logto/commit/d4fc7b3e5f4979f8419b87393bfd1af02e9a191d))
- **core:** update user scopes ([#1922](https://github.com/logto-io/logto/issues/1922)) ([8d22b5c](https://github.com/logto-io/logto/commit/8d22b5c468e5148a3815abf93de14644cdf68e8e))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### ⚠ BREAKING CHANGES

- **core:** load connectors by folder (#1879)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))
- **core:** load connectors by folder ([#1879](https://github.com/logto-io/logto/issues/1879)) ([52b9dd8](https://github.com/logto-io/logto/commit/52b9dd8569017ad7fda97a847c95ca1e391aabae))

### Bug Fixes

- fetch connectors list from npm ([#1894](https://github.com/logto-io/logto/issues/1894)) ([c6764f9](https://github.com/logto-io/logto/commit/c6764f95f78ce30148e5439cd08ff87b1608b9b5))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

### Features

- **connector:** add kakao connector ([#1826](https://github.com/logto-io/logto/issues/1826)) ([1f9e820](https://github.com/logto-io/logto/commit/1f9e820eb60d0034b82099fe5a9c96457e47101e))

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

### Features

- **core:** guard session with sign-in mode ([a8a3de3](https://github.com/logto-io/logto/commit/a8a3de35443cec485a435d51b452af0f9a56ed28))

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

### ⚠ BREAKING CHANGES

- **core,console:** remove `/me` apis (#1781)

### Features

- **core:** enable userinfo endpoint ([#1783](https://github.com/logto-io/logto/issues/1783)) ([a6bb2f7](https://github.com/logto-io/logto/commit/a6bb2f7ec239cf036c740fbee79c20c73cf6d694))
- **core:** hasura authn ([#1790](https://github.com/logto-io/logto/issues/1790)) ([87d3a53](https://github.com/logto-io/logto/commit/87d3a53b65ad18be337fffd78aaecd3483c8f33b))
- **core:** set user default roles from env ([#1793](https://github.com/logto-io/logto/issues/1793)) ([4afdf3c](https://github.com/logto-io/logto/commit/4afdf3cb4c868cc85ba1d6b155165515a431d771))

### Bug Fixes

- **core:** fix ac & ui proxy under subpath deployment ([#1761](https://github.com/logto-io/logto/issues/1761)) ([163c23b](https://github.com/logto-io/logto/commit/163c23b9bd3019e1187de9dec1a2fdd2201630f7))
- **deps:** update dependency slonik to v30 ([#1744](https://github.com/logto-io/logto/issues/1744)) ([a9f99db](https://github.com/logto-io/logto/commit/a9f99db54e8b6e8c951832d800a1eedc311234c2))

### Code Refactoring

- **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### ⚠ BREAKING CHANGES

- **core:** use comma separated values as a string array in the env file (#1762)

### Features

- **core,schemas:** add application secret ([#1715](https://github.com/logto-io/logto/issues/1715)) ([543ee04](https://github.com/logto-io/logto/commit/543ee04f53f81b41b0669f0ac5773fc67d500c0c))
- **core:** support signing key rotation ([#1732](https://github.com/logto-io/logto/issues/1732)) ([00bab4c](https://github.com/logto-io/logto/commit/00bab4c09582797c31d9bc5c7fe6d3c4b44a2f36))
- **core:** use comma separated values as a string array in the env file ([#1762](https://github.com/logto-io/logto/issues/1762)) ([f6db981](https://github.com/logto-io/logto/commit/f6db981600fd16a860262336ad88d886ca502628))

### Bug Fixes

- **deps:** update dependency slonik to v29 ([#1700](https://github.com/logto-io/logto/issues/1700)) ([21a0c8f](https://github.com/logto-io/logto/commit/21a0c8f635cd561417dd23bca1d899771da6321a))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **connector:** azure active directory connector added ([#1662](https://github.com/logto-io/logto/issues/1662)) ([875a828](https://github.com/logto-io/logto/commit/875a82883161b79b11873bcfce2856e7b84502b4))
- **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)

### Features

- **core:** api GET /me ([#1650](https://github.com/logto-io/logto/issues/1650)) ([4bf6483](https://github.com/logto-io/logto/commit/4bf6483ff4674052d4b5d00d647c0c408b3ecc7f))
- **core:** refresh token rotation reuse interval ([#1617](https://github.com/logto-io/logto/issues/1617)) ([bb245ad](https://github.com/logto-io/logto/commit/bb245adbb917dd066db2fe9cfbdbe102394e2c0e))
- **core:** support integration test env config ([#1619](https://github.com/logto-io/logto/issues/1619)) ([708523e](https://github.com/logto-io/logto/commit/708523ed5287683cc23c6a93e01fe55dbd838e8c))

### Bug Fixes

- **core:** resolve some core no-restricted-syntax lint error ([#1606](https://github.com/logto-io/logto/issues/1606)) ([c56ddec](https://github.com/logto-io/logto/commit/c56ddec84ade4da1385d9821a1149375a70167dd))
- **deps:** update dependency koa-router to v12 ([#1596](https://github.com/logto-io/logto/issues/1596)) ([6e96d73](https://github.com/logto-io/logto/commit/6e96d73a7c187c5dd25a7977654387ad2f33f3b2))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

### Features

- **core:** add response guard ([#1542](https://github.com/logto-io/logto/issues/1542)) ([6c39790](https://github.com/logto-io/logto/commit/6c397901805b01613df71eecaa06d3d84d0b606a))

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

### Features

- **core:** add admin guard to signin ([#1523](https://github.com/logto-io/logto/issues/1523)) ([3e76de0](https://github.com/logto-io/logto/commit/3e76de0ac9ed1be5ad3903fc1c3863673014d9c2))
- **core:** read connector packages env ([#1478](https://github.com/logto-io/logto/issues/1478)) ([adadcbe](https://github.com/logto-io/logto/commit/adadcbe21619da325673ef3f96f1ddc1a073540d))

### Bug Fixes

- **connector:** fix connector getConfig and validateConfig type ([#1530](https://github.com/logto-io/logto/issues/1530)) ([88a54aa](https://github.com/logto-io/logto/commit/88a54aaa9ebce419c149a33150a4927296cb705b))
- **connector:** passwordless connector send test msg with unsaved config ([#1539](https://github.com/logto-io/logto/issues/1539)) ([0297f6c](https://github.com/logto-io/logto/commit/0297f6c52f7b5d730de44fbb08f88c2e9b951874))
- **connector:** refactor ConnectorInstance as class ([#1541](https://github.com/logto-io/logto/issues/1541)) ([6b9ad58](https://github.com/logto-io/logto/commit/6b9ad580ae86fbcc100a100aab1d834090e682a3))
- **ui,core:** fix i18n issue ([#1548](https://github.com/logto-io/logto/issues/1548)) ([6b58d8a](https://github.com/logto-io/logto/commit/6b58d8a1610b1b75155d873e8898786d2b723ec6))

## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)

### Features

- **connector:** connector error handler, throw errmsg on general errors ([#1458](https://github.com/logto-io/logto/issues/1458)) ([7da1de3](https://github.com/logto-io/logto/commit/7da1de33e97de4aeeec9f9b6cea59d1bf90ba623))
- expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))

### Bug Fixes

- **core:** add session check ([#1453](https://github.com/logto-io/logto/issues/1453)) ([78e06d5](https://github.com/logto-io/logto/commit/78e06d5c7f458d9174f4d057ba83f738717510f5))

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

### Features

- **core:** append additional yaml responses to swagger.json ([#1407](https://github.com/logto-io/logto/issues/1407)) ([100bffb](https://github.com/logto-io/logto/commit/100bffbc6aa51478bda432ba01491a708bdcd172))

### Bug Fixes

- **core,ui:** remove todo comments ([#1454](https://github.com/logto-io/logto/issues/1454)) ([d5d6c5e](https://github.com/logto-io/logto/commit/d5d6c5ed083364dabaa0220deaa6a22e0350d146))
- **deps:** update dependency koa-router to v11 ([#1406](https://github.com/logto-io/logto/issues/1406)) ([ff6f223](https://github.com/logto-io/logto/commit/ff6f2235eaa2a146f11de9299e38fb1b7fae9bc6))

## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

**Note:** Version bump only for package @logto/core

## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)

### Bug Fixes

- **core:** do not titlize tags of .well-known APIs ([#1412](https://github.com/logto-io/logto/issues/1412)) ([5559fb1](https://github.com/logto-io/logto/commit/5559fb10c33932300d9f863cb3f57c48c504acdc))

## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)

### Features

- **core:** auto sign-out ([#1369](https://github.com/logto-io/logto/issues/1369)) ([6c32340](https://github.com/logto-io/logto/commit/6c323403b391ac09100aad87e7c9f59b588bdd45))

### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/core

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
- **connector-alipay-native:** add Alipay Native connector ([#873](https://github.com/logto-io/logto/issues/873)) ([9589aea](https://github.com/logto-io/logto/commit/9589aeafec8592531aa1dfe598ca6cec7325eded))
- **connector-sendgrid-email:** add sendgrid email connector ([#850](https://github.com/logto-io/logto/issues/850)) ([b887655](https://github.com/logto-io/logto/commit/b8876558275e28ca921d4eeea6c38f8559810a11))
- **connector-twilio-sms:** add twilio sms connector ([#881](https://github.com/logto-io/logto/issues/881)) ([d7ce13d](https://github.com/logto-io/logto/commit/d7ce13d260ec79e0c0f68bf3068cb9c79adf5273))
- **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
- **connectors:** handle authorization callback parameters in each connector respectively ([#1166](https://github.com/logto-io/logto/issues/1166)) ([097aade](https://github.com/logto-io/logto/commit/097aade2e2e1b1ea1531bcb4c1cca8d24961a9b9))
- **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
- **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/logto/issues/679)) ([a0b4b98](https://github.com/logto-io/logto/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
- **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
- **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
- **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
- **core,connectors:** update Aliyun logo and add logo_dark to Apple, Github ([#1194](https://github.com/logto-io/logto/issues/1194)) ([98f8083](https://github.com/logto-io/logto/commit/98f808320b1c79c51f8bd6f49e35ca44363ea560))
- **core,console:** change admin user password ([#1268](https://github.com/logto-io/logto/issues/1268)) ([a4d0a94](https://github.com/logto-io/logto/commit/a4d0a940bdabb213866407afb6c064b6740ce593))
- **core,console:** connector platform tabs ([#887](https://github.com/logto-io/logto/issues/887)) ([65fb36c](https://github.com/logto-io/logto/commit/65fb36ce3fd021cd44aeff95c4a01e75fe1352e7))
- **core,console:** social connector targets ([#851](https://github.com/logto-io/logto/issues/851)) ([127664a](https://github.com/logto-io/logto/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
- **core,schemas:** koaLogSession middleware ([#767](https://github.com/logto-io/logto/issues/767)) ([4e60446](https://github.com/logto-io/logto/commit/4e6044641190faaa2ee4f8d4765118e381df8a30))
- **core,schemas:** log IP and user agent ([#682](https://github.com/logto-io/logto/issues/682)) ([0ecb7e4](https://github.com/logto-io/logto/commit/0ecb7e4d2fe869ada46cc39e0fef98d2240cb1b2))
- **core,schemas:** log token exchange success ([#809](https://github.com/logto-io/logto/issues/809)) ([3b048a8](https://github.com/logto-io/logto/commit/3b048a80a374ff720a5afe3b35f007b31fddd576))
- **core,schemas:** save application id that the user first consented ([#688](https://github.com/logto-io/logto/issues/688)) ([4521c3c](https://github.com/logto-io/logto/commit/4521c3c8d17becb6b322fc0128fff992f34d2a0d))
- **core,shared:** get /dashboard/users/active ([#953](https://github.com/logto-io/logto/issues/953)) ([1420bb2](https://github.com/logto-io/logto/commit/1420bb28cec9c0e20b4d0645a58e436135f87c83))
- **core:** add admin role validation to the koaAuth ([#920](https://github.com/logto-io/logto/issues/920)) ([cf360b9](https://github.com/logto-io/logto/commit/cf360b9c15594b0923c79adf3a401e29d84fad23))
- **core:** add custom claims to id token ([#911](https://github.com/logto-io/logto/issues/911)) ([9ccda93](https://github.com/logto-io/logto/commit/9ccda932a45816be2089d3e58c8e91f55b9ecce9))
- **core:** add etag for settings api ([#1011](https://github.com/logto-io/logto/issues/1011)) ([d4f38bc](https://github.com/logto-io/logto/commit/d4f38bce2b016ddd4e6d5f260e04c7e0f4f312f7))
- **core:** add phone number and email mask ([#891](https://github.com/logto-io/logto/issues/891)) ([67f080e](https://github.com/logto-io/logto/commit/67f080e8623de0417436f9897f1179e6cdc62130))
- **core:** add role table seed ([#1145](https://github.com/logto-io/logto/issues/1145)) ([837ad52](https://github.com/logto-io/logto/commit/837ad523cef4a41ab9fdddfe7a92b6ed074114a0))
- **core:** add sign-in-mode ([#1132](https://github.com/logto-io/logto/issues/1132)) ([f640dad](https://github.com/logto-io/logto/commit/f640dad52f2e75620b392114673860138e1aca2c))
- **core:** add smtp connector ([#1131](https://github.com/logto-io/logto/issues/1131)) ([f8710e1](https://github.com/logto-io/logto/commit/f8710e147d1299a53598e68188044a5f25caf2e3))
- **core:** add socialConnectors details for get sign-in-settings ([#804](https://github.com/logto-io/logto/issues/804)) ([7a922cb](https://github.com/logto-io/logto/commit/7a922cbd331b45443f7f19a8af3dcd9156453079))
- **core:** add switch of enabling object fully replace when updating DB ([#1107](https://github.com/logto-io/logto/issues/1107)) ([efa9491](https://github.com/logto-io/logto/commit/efa9491749f6702ba0d15ab50818e8a9622fdd90))
- **core:** add welcome route ([#1080](https://github.com/logto-io/logto/issues/1080)) ([f6f562a](https://github.com/logto-io/logto/commit/f6f562a8ba2c67793246eded995285eb5b68c1c7))
- **core:** align connector error handler middleware with ConnectorErrorCodes ([#1063](https://github.com/logto-io/logto/issues/1063)) ([1b8190a](https://github.com/logto-io/logto/commit/1b8190addfd33bf9a317f991023984a2efdb6796))
- **core:** any-type parameter shows empty object in swagger example ([#1110](https://github.com/logto-io/logto/issues/1110)) ([7339a85](https://github.com/logto-io/logto/commit/7339a85a1bb4f1a8c69a05fb5bfd61f154b24eb7))
- **core:** append page and page_size to the query parameters in swagger.json ([#1120](https://github.com/logto-io/logto/issues/1120)) ([a262999](https://github.com/logto-io/logto/commit/a26299941f71fd6cae51380c05a9e49f4fae2084))
- **core:** convert route guards to swagger.json ([#1047](https://github.com/logto-io/logto/issues/1047)) ([3145c9b](https://github.com/logto-io/logto/commit/3145c9b34824e9107a98625dc2998f605a936ae8))
- **core:** convert Zod union, literal and string guards to OpenAPI schemas ([#1126](https://github.com/logto-io/logto/issues/1126)) ([511012d](https://github.com/logto-io/logto/commit/511012da92bf1cae9e8429b343f4554b8c4230f0))
- **core:** cookie keys configuration ([#902](https://github.com/logto-io/logto/issues/902)) ([17c63cd](https://github.com/logto-io/logto/commit/17c63cd2d9fe5f3f66fe2404a7358f0d8524e667))
- **core:** dau curve contains 0 count points ([#1105](https://github.com/logto-io/logto/issues/1105)) ([75ac874](https://github.com/logto-io/logto/commit/75ac874a2d02e308d6a63f4925e3f9b2c3377b8d))
- **core:** disable introspection feature ([#886](https://github.com/logto-io/logto/issues/886)) ([b2ac2c1](https://github.com/logto-io/logto/commit/b2ac2c14eead0fba45dec90115f75dd2074e04ee))
- **core:** empty path sould redirect to the console page ([#915](https://github.com/logto-io/logto/issues/915)) ([207c404](https://github.com/logto-io/logto/commit/207c404aebd062f2f46742748ed08c5d97368dbc))
- **core:** expose connector and metadata from sendPasscode ([#806](https://github.com/logto-io/logto/issues/806)) ([0ea5513](https://github.com/logto-io/logto/commit/0ea55134a92252a00f6b3532cdde71ae96979452))
- **core:** fix connectors' initialization ([c6f2546](https://github.com/logto-io/logto/commit/c6f2546126ec48da0ef28f939a062c844c03b2b7))
- **core:** get /dashboard/users/new ([#940](https://github.com/logto-io/logto/issues/940)) ([45a9777](https://github.com/logto-io/logto/commit/45a977790eca01b212f51047d5636ff882873dd8))
- **core:** get /dashboard/users/total ([#936](https://github.com/logto-io/logto/issues/936)) ([c4bb0de](https://github.com/logto-io/logto/commit/c4bb0de7d426055b3634d8e4dace5cface7f2f0f))
- **core:** get /logs ([#823](https://github.com/logto-io/logto/issues/823)) ([4ffd4c0](https://github.com/logto-io/logto/commit/4ffd4c048028567f701e5a3d6a507907b63a0151))
- **core:** get /logs/:id ([#934](https://github.com/logto-io/logto/issues/934)) ([bddf47b](https://github.com/logto-io/logto/commit/bddf47bf90213397688f3566f0018029e5959709))
- **core:** grantErrorListener for logging token exchange error ([#894](https://github.com/logto-io/logto/issues/894)) ([797344f](https://github.com/logto-io/logto/commit/797344f6f5e3b64e1d8861eeeac0d18cb59032f2))
- **core:** grantRevokedListener for logging revocation of access and refresh token ([#900](https://github.com/logto-io/logto/issues/900)) ([e5196fc](https://github.com/logto-io/logto/commit/e5196fc31dc1c4ec8086c9df2d1cc8f5486af380))
- **core:** identities key should use target not connectorId ([#1115](https://github.com/logto-io/logto/issues/1115)) ([41e37a7](https://github.com/logto-io/logto/commit/41e37a79955ac4f6437c4e52c1cf3f74adaad811)), closes [#1134](https://github.com/logto-io/logto/issues/1134)
- **core:** log error body ([#1065](https://github.com/logto-io/logto/issues/1065)) ([2ba1121](https://github.com/logto-io/logto/commit/2ba11215edc8bc83efcd41e1587b53fddc5bb101))
- **core:** log sending passcode with connector id ([#824](https://github.com/logto-io/logto/issues/824)) ([82c7138](https://github.com/logto-io/logto/commit/82c7138683f1027a227b3939d7516e0912773fe5))
- **core:** make GET /api/swagger.json contain all api routes ([#1008](https://github.com/logto-io/logto/issues/1008)) ([8af2f95](https://github.com/logto-io/logto/commit/8af2f953cf826cc5c72c0b7a0ae30d50b8caa6d9))
- **core:** order logs by created_at desc ([#993](https://github.com/logto-io/logto/issues/993)) ([2ae4e2e](https://github.com/logto-io/logto/commit/2ae4e2eccfd3699516d4d192f42607fea2b56623))
- **core:** register with admin role ([#1140](https://github.com/logto-io/logto/issues/1140)) ([4f32ad3](https://github.com/logto-io/logto/commit/4f32ad3a511985b1ccb8706cff3b604c86a7d50b))
- **core:** remove code redundancy ([d989785](https://github.com/logto-io/logto/commit/d98978565864852b4885ecf5f4d2fb1fa807601c))
- **core:** remove unnecessary variable check and unused route ([#1084](https://github.com/logto-io/logto/issues/1084)) ([bcc05e5](https://github.com/logto-io/logto/commit/bcc05e521d3b0017421b7a3ae30a7e5e2b015b87))
- **core:** separate social sign-in api ([#735](https://github.com/logto-io/logto/issues/735)) ([e71cf7e](https://github.com/logto-io/logto/commit/e71cf7ea67dbd22eac6a3aa12aa20687c00aa7e6))
- **core:** serve connector logo ([#931](https://github.com/logto-io/logto/issues/931)) ([5b44b71](https://github.com/logto-io/logto/commit/5b44b7194ed4f98c6c2e77aae828a39b477b6010))
- **core:** set claims for `profile` scope ([#1013](https://github.com/logto-io/logto/issues/1013)) ([7781d49](https://github.com/logto-io/logto/commit/7781d496676cc233b4d62214fa11e9fdfda21929))
- **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
- **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
- **native-connectors:** pass random state to native connector sdk ([#922](https://github.com/logto-io/logto/issues/922)) ([9679620](https://github.com/logto-io/logto/commit/96796203dd4247d7ecdee044f13f3d57f04ca461))
- remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/logto/issues/930)) ([054b0f7](https://github.com/logto-io/logto/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
- update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
- use user level custom data to save preferences ([#1045](https://github.com/logto-io/logto/issues/1045)) ([f2b44b4](https://github.com/logto-io/logto/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **connector-wechat-native:** fix wechat-native target ([#820](https://github.com/logto-io/logto/issues/820)) ([ab6c124](https://github.com/logto-io/logto/commit/ab6c1246207fd191b1db27d172500a5e7a2d8050))
- connectors platform ([#925](https://github.com/logto-io/logto/issues/925)) ([16ec018](https://github.com/logto-io/logto/commit/16ec018b711baeec28a22a7780370044c230bd24))
- **console,core:** only show enabled connectors in sign in methods ([#988](https://github.com/logto-io/logto/issues/988)) ([4768181](https://github.com/logto-io/logto/commit/4768181bf77261eb84a1c4cb903fa0a22765d837))
- **console:** update terms of use ([#1122](https://github.com/logto-io/logto/issues/1122)) ([9262a6f](https://github.com/logto-io/logto/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
- **console:** update user data ([#1184](https://github.com/logto-io/logto/issues/1184)) ([a3d3a79](https://github.com/logto-io/logto/commit/a3d3a79dd9c93c2bd23af78da1eb45de81642c3f))
- **core,console:** delete specific user identities by target ([#1176](https://github.com/logto-io/logto/issues/1176)) ([ad86bc8](https://github.com/logto-io/logto/commit/ad86bc8e120e571268cffbb45fe3c8253c1207fe))
- **core:** align jsonb replace mode ([#1138](https://github.com/logto-io/logto/issues/1138)) ([3cf34b5](https://github.com/logto-io/logto/commit/3cf34b59112a2d20cdc1f1dfc0d2802a27c886c2))
- **core:** allow empty condition in logs ([#991](https://github.com/logto-io/logto/issues/991)) ([2819859](https://github.com/logto-io/logto/commit/28198590faa16b010dfb8050738a1f9a60f26bd9))
- **core:** catch interaction not found error ([#827](https://github.com/logto-io/logto/issues/827)) ([38ceae7](https://github.com/logto-io/logto/commit/38ceae78536fadabd1abfb845c3172908d4662b4))
- **core:** disabled session check for preview mode ([#867](https://github.com/logto-io/logto/issues/867)) ([82674ee](https://github.com/logto-io/logto/commit/82674eea885e6819213f10833b6a5a66dec9f6ac))
- **core:** fix connector readme and configTemplate content parsing ([#1267](https://github.com/logto-io/logto/issues/1267)) ([05db124](https://github.com/logto-io/logto/commit/05db12492c98c42b760a86a339838ee4b6d5ca6d))
- **core:** fix preview session not found bug ([#970](https://github.com/logto-io/logto/issues/970)) ([545a392](https://github.com/logto-io/logto/commit/545a3929e4e0bd8853c142ec5ca27520ba428da1))
- **core:** koaAuth should return 403 instead of 401 on non-admin role ([ee16eeb](https://github.com/logto-io/logto/commit/ee16eeb9662d99d04a8d2c2770f89f0641f1e743))
- **core:** prevent session lost for bind social ([#948](https://github.com/logto-io/logto/issues/948)) ([077ed12](https://github.com/logto-io/logto/commit/077ed120f09cdfdb81e95cbb434488569f87bfd1))
- **core:** remove ESM declaration ([#687](https://github.com/logto-io/logto/issues/687)) ([e61dba9](https://github.com/logto-io/logto/commit/e61dba90a815f8bd2ab72861c7e8bcefcfcc4b0d))
- **core:** remove name regex ([#1109](https://github.com/logto-io/logto/issues/1109)) ([a790248](https://github.com/logto-io/logto/commit/a790248c091e444614652b08b05686e9934cb639))
- **core:** remove unavailable social sign in targets on save ([#1201](https://github.com/logto-io/logto/issues/1201)) ([012562e](https://github.com/logto-io/logto/commit/012562e2a8226525b4d4b8c80eb092b1780e0221))
- **core:** revert add custom claims to id token ([#919](https://github.com/logto-io/logto/issues/919)) ([fe99928](https://github.com/logto-io/logto/commit/fe99928a41e1987f7fd078b711c9a0bb2c86e5c9))
- **core:** set module in base config ([#685](https://github.com/logto-io/logto/issues/685)) ([d108f4b](https://github.com/logto-io/logto/commit/d108f4b8833ea86ccfe74b2165e844493f738da4))
- **core:** settings api should not throw session not found error ([#1157](https://github.com/logto-io/logto/issues/1157)) ([e0793fa](https://github.com/logto-io/logto/commit/e0793facb92d0b10a0c52e3346f4fd4ad81662cd))
- **core:** signing in with a non-existing username should throw invalid credentials ([#1239](https://github.com/logto-io/logto/issues/1239)) ([53781d6](https://github.com/logto-io/logto/commit/53781d619dedc4e51d87d4ad917d0dbfcc1510d9))
- **core:** social user info in session ([#794](https://github.com/logto-io/logto/issues/794)) ([74f2940](https://github.com/logto-io/logto/commit/74f2940398ecdfe00f0d8306f01451d859cff186))
- **core:** update proxy guard middleware ([#963](https://github.com/logto-io/logto/issues/963)) ([909535f](https://github.com/logto-io/logto/commit/909535f4af95b40ac8714a92afb5cbd48f4fa47b))
- **core:** update role names ([#913](https://github.com/logto-io/logto/issues/913)) ([d659995](https://github.com/logto-io/logto/commit/d65999514f9d3d516bc18e1e0396eff8b42daa50))
- **core:** update roleNames to role_names to resolve 401 errors ([5a1fa14](https://github.com/logto-io/logto/commit/5a1fa14a981cba0fa7314941902a8d017fad42f3))
- **core:** update timestamp field with millisecond precision ([#677](https://github.com/logto-io/logto/issues/677)) ([7278ba4](https://github.com/logto-io/logto/commit/7278ba40958ca57468e562a6978c25e6c993dd20))
- delete custom domain ([#737](https://github.com/logto-io/logto/issues/737)) ([8a48fb6](https://github.com/logto-io/logto/commit/8a48fb6225f9850aeec7917a54d849fd9a88254e))
- **ui:** fix sign-in not found bug ([#841](https://github.com/logto-io/logto/issues/841)) ([5d34442](https://github.com/logto-io/logto/commit/5d34442018d0577ff3f90d57008d2af5d4f5b54b))
