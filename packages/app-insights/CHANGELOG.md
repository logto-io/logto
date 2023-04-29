# @logto/app-insights

## 1.3.0

### Minor Changes

- 5a8442712: add custom events and new component

  - implement `getEventName()` to create standard event name with the format `<component>/<event>[/data]`. E.g. `core/sign_in`.
  - four new event components `core`, `console`, `blog`, and `website`.
  - implement `<TrackOnce />` for tracking a custom event once

## 1.2.0

### Minor Changes

- 4331deb6f: support ClickAnalytics plugin
- 748878ce5: add React context and hook to app-insights, fix init issue for frontend projects

## 1.1.0

### Minor Changes

- 352807b16: support setting cloud role name for AppInsights in React

## 1.0.1

### Patch Changes

- 8197885e4: fixed package export for ESM
