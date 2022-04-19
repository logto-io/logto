---
sidebar_position: 1.1
---

**ENUM**

# `LogtoClientErrorTypes.AccessToken`

```swift
public enum AccessToken
```

## Cases
### `noRefreshTokenFound`

```swift
case noRefreshTokenFound
```

No Refresh Token presents in the Keychain.

### `unableToFetchTokenByRefreshToken`

```swift
case unableToFetchTokenByRefreshToken
```

Unable to use Refresh Token to fetch a new Access Token.
The Refresh Token could be expired or revoked.
