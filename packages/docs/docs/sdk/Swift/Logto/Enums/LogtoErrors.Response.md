---
sidebar_position: 3.1
---

**ENUM**

# `LogtoErrors.Response`

```swift
public enum Response: LocalizedError, Equatable
```

## Cases
### `notHttpResponse(response:)`

```swift
case notHttpResponse(response: URLResponse?)
```

### `withCode(code:httpResponse:data:)`

```swift
case withCode(code: Int, httpResponse: HTTPURLResponse, data: Data?)
```
