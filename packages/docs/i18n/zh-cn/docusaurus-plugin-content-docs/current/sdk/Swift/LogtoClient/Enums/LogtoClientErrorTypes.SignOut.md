---
sidebar_position: 1.1
---

**枚举**

# `LogtoClientErrorTypes.SignOut`

```swift
public enum SignOut: String
```

## 枚举情况
### `unableToRevokeToken`

```swift
case unableToRevokeToken
```

无法吊销 OIDC provider 中的 token。通常该错误可以被安全地忽略。
