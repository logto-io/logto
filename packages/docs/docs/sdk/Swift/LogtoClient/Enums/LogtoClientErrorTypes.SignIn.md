---
sidebar_position: 1.1
---

**ENUM**

# `LogtoClientErrorTypes.SignIn`

```swift
public enum SignIn: String
```

## Cases
### `unknownError`

```swift
case unknownError
```

### `authFailed`

```swift
case authFailed
```

Failed to complete the authentication.
This could be an internal error or the user canceled the authentication.

### `unableToConstructRedirectUri`

```swift
case unableToConstructRedirectUri
```

Unable to construct Redirect URI for the given string.

### `unableToConstructAuthUri`

```swift
case unableToConstructAuthUri
```

Unable to construct Redirect URI for the config.
Please double check OIDC and Logto config.

### `unableToFetchToken`

```swift
case unableToFetchToken
```

Unable to finish the initial token request after authentication.

### `unexpectedSignInCallback`

```swift
case unexpectedSignInCallback
```

The sign in callback URI is not valid.
