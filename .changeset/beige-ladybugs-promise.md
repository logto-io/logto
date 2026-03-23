---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
"@logto/schemas": minor
---

support OAuth 2.0 Device Authorization Grant (device flow)

Device flow lets users sign in on input-limited devices such as smart TVs, CLI tools, IoT gadgets, and gaming consoles by completing authentication on a separate device like a phone or laptop.

How it works:

1. The device displays a short user code and a verification URL.
2. The user opens the URL on another device, enters the code, and signs in.
3. Once approved, the original device receives tokens and completes authentication.

To create a device flow application in Console:

- Select "Input-limited app / CLI" under the Native framework list, or
- Create an app without framework, then choose "Device flow" as the authorization flow, or
- Create a third-party Native app, then choose "Device flow" as the authorization flow.

The application settings page shows a device-flow-specific guide and a built-in demo you can try immediately.
