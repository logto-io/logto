---
"@logto/experience": patch
---

skip non-object messages in the native environment

In the `WKWebView` of new iOS versions, some script will constantly post messages to the
window object with increasing numbers as the message content ("1", "2", "3", ...).

Ideally, we should check the source of the message with Logto-specific identifier in the
`event.data`; however, this change will result a breaking change for the existing
native SDK implementations. Add the `isObject` check to prevent the crazy messages while
keeping the backward compatibility.
