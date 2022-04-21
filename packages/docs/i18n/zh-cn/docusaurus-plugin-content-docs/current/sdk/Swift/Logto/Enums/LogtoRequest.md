---
sidebar_position: 4
---

**枚举**

# `LogtoRequest`

```swift
public enum LogtoRequest
```

## 枚举
###   [LogtoRequest.HttpMethod](LogtoRequest.HttpMethod.md)

## 方法
### `load(useSession:method:url:headers:body:)`

```swift
public static func load(
    useSession session: NetworkSession,
    method: HttpMethod,
    url: URL,
    headers: [String: String] = [:],
    body: Data? = nil
) async -> (Data?, Error?)
```

### `load(useSession:method:endpoint:headers:body:)`

```swift
public static func load(
    useSession session: NetworkSession,
    method: HttpMethod,
    endpoint: String,
    headers: [String: String] = [:],
    body: Data? = nil
) async -> (Data?, Error?)
```

### `get(useSession:endpoint:headers:)`

```swift
public static func get<T: Codable>(
    useSession session: NetworkSession,
    endpoint: String,
    headers: [String: String] = [:]
) async throws -> T
```

### `get(useSession:url:headers:)`

```swift
public static func get<T: Codable>(
    useSession session: NetworkSession,
    url: URL,
    headers: [String: String] = [:]
) async throws -> T
```

### `post(useSession:endpoint:headers:body:)`

```swift
public static func post<T: Codable>(
    useSession session: NetworkSession,
    endpoint: String,
    headers: [String: String] = [:],
    body: Data? = nil
) async throws -> T
```

### `post(useSession:endpoint:headers:body:)`

```swift
public static func post(
    useSession session: NetworkSession,
    endpoint: String,
    headers: [String: String] = [:],
    body: Data? = nil
) async throws
```
