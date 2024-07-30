---
"@logto/schemas": minor
"@logto/core": minor
---

add `custom_data` to applications

Introduce a new property `custom_data` to the `Application` schema. This property is an arbitrary object that can be used to store custom data for an application.

Added a new API to update the custom data of an application:

- `PATCH /applications/:applicationId/custom-data`
