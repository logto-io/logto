---
sidebar_position: 3.1
---

**枚举**

# `LogtoErrors.Response`

```swift
public enum Response: LocalizedError, Equatable
```

## 枚举情况
### `notHttpResponse(response:)`

```swift
case notHttpResponse(response: URLResponse?)
```

### `withCode(code:httpResponse:data:)`

```swift
case withCode(code: Int, httpResponse: HTTPURLResponse, data: Data?)
```
