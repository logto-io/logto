---
"@logto/schemas": minor
"@logto/core": minor
"@logto/console": minor
---

refactor the definition of hook event types

- Add `DataHook` event types. `DataHook` are triggered by data changes.
- Add "interaction" prefix to existing hook event types. Interaction hook events are triggered by end user interactions, e.g. completing sign-in.
