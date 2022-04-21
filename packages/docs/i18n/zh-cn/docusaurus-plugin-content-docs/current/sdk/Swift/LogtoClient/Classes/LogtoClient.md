**类**

# `LogtoClient`

```swift
public class LogtoClient
```

## 结构体

###   [NotificationObject](../Structs/LogtoClient.NotificationObject.md)

## 属性
### `HandleNotification`

```swift
public static let HandleNotification = Notification.Name("Logto Handle")
```

供 LogtoClient 处理的通知名称。

### `idToken`

```swift
public internal(set) var idToken: String?
```

经过缓存的原始 ID Token 字符串。使用 `.getIdTokenClaims()` 以获得结构化数据。

### `refreshToken`

```swift
public internal(set) var refreshToken: String?
```

经过缓存的 Refresh Token。

### `oidcConfig`

```swift
public internal(set) var oidcConfig: LogtoCore.OidcConfigResponse?
```

通过 [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) 接口获得的配置。

### `isAuthenticated`

```swift
public var isAuthenticated: Bool
```

用户是否已经登录。

## 方法
### `handle(forClientId:url:)`

```swift
public static func handle(forClientId clientId: String? = nil, url: URL)
```

发送一个通知让 Logto 客户端处理该 URL。通常该函数需要在 `onOpenURL(perform:)` (SwiftUI) 或者 `application(_:open:options:)` (AppDelegate) 被调用。详情见集成指南。

#### 参数

| 名称 | 描述 |
| ---- | ----------- |
| forClientId | 该通知是否仅供特定的客户端 ID。当值为 `nil` 时，所有的 Logto 客户端会尝试处理该通知。 |
| url | 需要被处理的 URL。 |

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

启动一个基于 WKWebView 的登录会话。如果该函数在没有抛出错误的情况下返回，说明用户已经成功登录。

- 抛出：一个错误如果会话无法成功完成。

#### 参数

| 名称 | 描述 |
| ---- | ----------- |
| redirectUri | 该应用的 Redirect URI 列表中的一项。 |

### `signOut()`

```swift
func signOut() async -> Errors.SignOut?
```

清理所有在内存与 Keychain 中的 token。同时尝试吊销在 OIDC provider 中的 Refresh Token。

- 返回：一个错误如果吊销 token 失败。通常该错误可以被安全地忽略。

### `getAccessToken(for:)`

```swift
@MainActor public func getAccessToken(for resource: String?) async throws -> String
```

对于提供的 resource 获取一个 Access Token。如果 resource 为 `nil`，则返回用于用户信息接口的 Access Token。

如果缓存的 Access Token 已过期，该函数会尝试使用 Refresh Token 去 OIDC provider 获得一个新的 Access Token。

- 抛出：一个错误如果无法获取到一个有效的 Access Token。
- 返回：Access Token 字符串。

#### 参数

| 名称 | 描述 |
| ---- | ----------- |
| resource | 资源指示器（Resource indicator）。 |

### `fetchUserInfo()`

```swift
public func fetchUserInfo() async throws -> LogtoCore.UserInfoResponse
```

### `getIdTokenClaims()`

```swift
public func getIdTokenClaims() throws -> IdTokenClaims
```

获取结构化的 [ID Token 声明](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)。

- 抛出：一个错误如果没有 ID Token 或者解码失败。

### `handle(url:)`

```swift
public func handle(url: URL) -> Bool
```

尝试通过遍历所有的社会化登录插件以处理给定的 URL。

如果有一个社会化登录插件处理了该 URL，则遍历会立即停止。

- 返回：`true` 如果有一个社会化登录插件处理了该 URL。

