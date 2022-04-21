---
sidebar_position: 1.1
---

**枚举**

# `LogtoClientErrorTypes.AccessToken`

```swift
public enum AccessToken
```

## 枚举情况
### `noRefreshTokenFound`

```swift
case noRefreshTokenFound
```

Keychain 中没有 Refresh Token。

### `unableToFetchTokenByRefreshToken`

```swift
case unableToFetchTokenByRefreshToken
```

无法通过 Refresh Token 获取一个新的 Access Token。该 Refresh Token 可能已经过期或者被吊销。
