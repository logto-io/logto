# @logto/app-insights

## 2.0.0

### Major Changes

- c1c746bca: remove application insights for react

### Patch Changes

- a9ccfc738: allow additional telemetry for `trackException()`

## 1.4.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3

## 1.3.1

### Patch Changes

- cfe4fce51: fix JSON stringify circular structure issue

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
