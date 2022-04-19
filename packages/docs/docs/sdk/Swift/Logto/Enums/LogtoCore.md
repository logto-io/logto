---
sidebar_position: 2
---

**ENUM**

# `LogtoCore`

```swift
public enum LogtoCore
```

## Structs
###   [CodeTokenResponse](../Structs/LogtoCore.CodeTokenResponse.md)
###   [OidcConfigResponse](../Structs/LogtoCore.OidcConfigResponse.md)
###   [RefreshTokenTokenResponse](../Structs/LogtoCore.RefreshTokenTokenResponse.md)
###   [UserInfoResponse](../Structs/LogtoCore.UserInfoResponse.md)

## Properties
### `postHeaders`

```swift
static let postHeaders: [String: String] = [
    "Content-Type": "application/x-www-form-urlencoded",
]
```

## Methods
### `fetchOidcConfig(useSession:uri:)`

```swift
static func fetchOidcConfig(
    useSession session: NetworkSession = URLSession.shared,
    uri: URL
) async throws -> OidcConfigResponse
```

### `fetchToken(useSession:byAuthorizationCode:codeVerifier:tokenEndpoint:clientId:redirectUri:)`

```swift
static func fetchToken(
    useSession session: NetworkSession = URLSession.shared,
    byAuthorizationCode code: String,
    codeVerifier: String,
    tokenEndpoint: String,
    clientId: String,
    redirectUri: String
) async throws -> CodeTokenResponse
```

Fetch token by `authorization_code`.
The returned `access_token` is only for user info enpoint.
Note the function will NOT validate any token in the response.

### `fetchToken(useSession:byRefreshToken:tokenEndpoint:clientId:resource:scopes:)`

```swift
static func fetchToken(
    useSession session: NetworkSession = URLSession.shared,
    byRefreshToken refreshToken: String,
    tokenEndpoint: String,
    clientId: String,
    resource: String?,
    scopes: [String]
) async throws -> RefreshTokenTokenResponse
```

Fetch token by `refresh_token`.
Note the function will NOT validate any token in the response.

### `fetchUserInfo(useSession:userInfoEndpoint:accessToken:)`

```swift
static func fetchUserInfo(
    useSession session: NetworkSession = URLSession.shared,
    userInfoEndpoint: String,
    accessToken: String
) async throws -> UserInfoResponse
```

### `fetchJwkSet(useSession:jwksUri:)`

```swift
static func fetchJwkSet(
    useSession session: NetworkSession = URLSession.shared,
    jwksUri: String
) async throws -> JWKSet
```

### `generateSignInUri(authorizationEndpoint:clientId:redirectUri:codeChallenge:state:scopes:resources:)`

```swift
static func generateSignInUri(
    authorizationEndpoint: String,
    clientId: String,
    redirectUri: URL,
    codeChallenge: String,
    state: String,
    scopes: [String] = [],
    resources: [String] = []
) throws -> URL
```

### `generateSignOutUri(endSessionEndpoint:idToken:postLogoutRedirectUri:)`

```swift
static func generateSignOutUri(
    endSessionEndpoint: String,
    idToken: String,
    postLogoutRedirectUri: String?
) throws -> URL
```

### `revoke(useSession:token:revocationEndpoint:clientId:)`

```swift
static func revoke(
    useSession session: NetworkSession = URLSession.shared,
    token: String,
    revocationEndpoint: String,
    clientId: String
) async throws
```

### `verifyAndParseSignInCallbackUri(_:redirectUri:state:)`

```swift
static func verifyAndParseSignInCallbackUri(
    _ callbackUri: URL,
    redirectUri: URL,
    state: String
) throws -> String
```

Verify the given `callbackUri` matches the requirements and return `code` parameter if success.
