**结构体**

# `LogtoConfig`

```swift
public struct LogtoConfig
```

## 属性
### `endpoint`

```swift
public let endpoint: URL
```

### `clientId`

```swift
public let clientId: String
```

### `resources`

```swift
public let resources: [String]
```

### `usingPersistStorage`

```swift
public let usingPersistStorage: Bool
```

### `scopes`

```swift
public var scopes: [String]
```

## 方法
### `init(endpoint:clientId:scopes:resources:usingPersistStorage:)`

```swift
public init(
    endpoint: String,
    clientId: String,
    scopes: [String] = [],
    resources: [String] = [],
    usingPersistStorage: Bool = true
) throws
```
