---
sidebar_position: 1.1
---

**枚举**

# `LogtoClientErrorTypes.SignIn`

```swift
public enum SignIn: String
```

## 枚举情况
### `unknownError`

```swift
case unknownError
```

### `authFailed`

```swift
case authFailed
```

无法完成验证（登录）。可能是一个内部错误或者用户取消了验证。

### `unableToConstructRedirectUri`

```swift
case unableToConstructRedirectUri
```

无法通过给定的字符串构建 Redirect URI。

### `unableToConstructAuthUri`

```swift
case unableToConstructAuthUri
```

无法通过配置构建 Redirect URI。请检查 OIDC 和 Logto 配置。

### `unableToFetchToken`

```swift
case unableToFetchToken
```

在验证结束后无法完成首次 token 请求。

### `unexpectedSignInCallback`

```swift
case unexpectedSignInCallback
```

登录回调 URI 无效。
