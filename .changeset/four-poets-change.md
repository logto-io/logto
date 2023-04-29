---
"@logto/app-insights": minor
---

add custom events and new component

- implement `getEventName()` to create standard event name with the format `<component>/<event>[/data]`. E.g. `core/sign_in`.
- four new event components `core`, `console`, `blog`, and `website`.
- implement `<TrackOnce />` for tracking a custom event once
