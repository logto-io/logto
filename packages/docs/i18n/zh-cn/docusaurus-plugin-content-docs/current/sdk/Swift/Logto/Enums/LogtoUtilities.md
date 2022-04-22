**枚举**

# `LogtoUtilities`

```swift
public enum LogtoUtilities
```

## 方法
### `withReservedScopes(_:)`

```swift
public static func withReservedScopes(_ scopes: [String]) -> [String]
```

### `generateState()`

```swift
public static func generateState() -> String
```

### `generateCodeVerifier()`

```swift
public static func generateCodeVerifier() -> String
```

### `generateCodeChallenge(codeVerifier:)`

```swift
public static func generateCodeChallenge(codeVerifier: String) -> String
```

### `decodeIdToken(_:)`

```swift
static func decodeIdToken(_ idToken: String) throws -> IdTokenClaims
```

Decode ID Token claims WITHOUT validation.
- Returns: A set of ID Token claims.

#### 参数

| 名称 | 描述 |
| ---- | ----------- |
| token | The JWT to decode. |

### `verifyIdToken(_:issuer:clientId:jwks:forTimeInterval:)`

```swift
static func verifyIdToken(
    _ idToken: String,
    issuer: String,
    clientId: String,
    jwks: JWKSet,
    forTimeInterval: TimeInterval = Date().timeIntervalSince1970
) throws
```

Verify the give ID Token:
* One of the JWKs matches the token.
* Issuer matches token payload `iss`.
* Client ID matches token payload `aud`.
* The token is not expired.
* The token is issued in +/- 1min.
