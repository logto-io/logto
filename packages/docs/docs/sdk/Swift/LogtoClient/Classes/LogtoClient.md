**CLASS**

# `LogtoClient`

```swift
public class LogtoClient
```

## Structs

###   [NotificationObject](../Structs/LogtoClient.NotificationObject.md)

## Properties
### `HandleNotification`

```swift
public static let HandleNotification = Notification.Name("Logto Handle")
```

The notification name for LogtoClient to handle.

### `idToken`

```swift
public internal(set) var idToken: String?
```

The cached ID Token in raw string.
Use `.getIdTokenClaims()` to retrieve structured data.

### `refreshToken`

```swift
public internal(set) var refreshToken: String?
```

The cached Refresh Token.

### `oidcConfig`

```swift
public internal(set) var oidcConfig: LogtoCore.OidcConfigResponse?
```

The config fetched from [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) endpoint.

### `isAuthenticated`

```swift
public var isAuthenticated: Bool
```

Whether the user has been authenticated.

## Methods
### `handle(forClientId:url:)`

```swift
public static func handle(forClientId clientId: String? = nil, url: URL)
```

Post a notification that tells Logto clients to handle the given URL.

Usually this function need to be called in `onOpenURL(perform:)` in SwiftUI or `application(_:open:options:)` in AppDelegate. See integration guide for detailed information.

#### Parameters

| Name | Description |
| ---- | ----------- |
| forClientId | If the notification is for specific client ID only. When `nil`, all Logto clients will try to handle the notification. |
| url | The URL that needs to be handled. |

### `init(useConfig:socialPlugins:session:)`

```swift
public init(
    useConfig config: LogtoConfig,
    socialPlugins: [LogtoSocialPlugin] = [],
    session: NetworkSession = URLSession.shared
)
```

### `signInWithBrowser(redirectUri:)`

```swift
public func signInWithBrowser(
    redirectUri: String
) async throws
```

Start a sign in session with WKWebView. If the function returns with no error threw, it means the user has signed in successfully.

- Throws: An error if the session failed to complete.

#### Parameters

| Name | Description |
| ---- | ----------- |
| redirectUri | One of Redirect URIs of this application. |

### `signOut()`

```swift
func signOut() async -> Errors.SignOut?
```

Clear all tokens in memory and Keychain. Also try to revoke the Refresh Token from the OIDC provider.

- Returns: An error if failed to revoke the token. Usually the error is safe to ignore.

### `getAccessToken(for:)`

```swift
@MainActor public func getAccessToken(for resource: String?) async throws -> String
```

Get an Access Token for the given resrouce. If resource is `nil`, return the Access Token for user endpoint.

If the cached Access Token has expired, this function will try to use `refreshToken` to fetch a new Access Token from the OIDC provider.

- Throws: An error if failed to get a valid Access Token.
- Returns: Access Token in string.

#### Parameters

| Name | Description |
| ---- | ----------- |
| resource | The resource indicator. |

### `fetchUserInfo()`

```swift
public func fetchUserInfo() async throws -> LogtoCore.UserInfoResponse
```

### `getIdTokenClaims()`

```swift
public func getIdTokenClaims() throws -> IdTokenClaims
```

Get structured [ID Token Claims](https://openid.net/specs/openid-connect-core-1_0.html#IDToken).
- Throws: An error if no ID Token presents or decode token failed.

### `handle(url:)`

```swift
public func handle(url: URL) -> Bool
```

Try to handle the given URL by iterating all social plugins.

The iteration stops when one of the social plugins handled the URL.

- Returns: `true` if one of the social plugins handled this URL.

