# Token Exchange Benchmark Result

Date: 2026-03-19  
Owner: Core/OIDC

## 1. Scope

This document records the production-like benchmark result for token exchange after the read-path optimization in PR `#8359`.

Benchmark target:

- token exchange with `resource`
- same client
- same user subject token
- same resource indicator
- warm-cache traffic shape

Test endpoint:

- `https://sxkxgo.app.logto.dev/oidc/token`

Effective backend observed in Azure:

- `logto-dev-eu.azurewebsites.net`

## 2. Data source

The result is based on two sources collected during the same run:

1. Internal timing logs from live Azure Web App log stream
2. Azure Application Insights request telemetry for `/oidc/token`

The internal timing data is the primary source of truth for the optimization result.

## 3. Previous baseline

From the read-path design document:

- `getResourceServerInfoMs`: `9-15ms`
- `findAccountMs`: `2-11ms`
- token exchange total in previous measurements: `28-43ms`

Reference:

- `docs/token-exchange-read-path-tech-design-2026-02-24.md`

## 4. Current result

### Internal timing result

Warm-path token exchange timing is now characterized by:

- `getResourceServerInfoMs`: `p50 ~= 2ms`
- `getResourceServerInfoMs`: most requests are in the `1-3ms` range
- `findAccountMs`: typically `1-3ms`
- `grantSaveMs`: typically `3-6ms`
- `accessTokenSaveMs`: typically `33-52ms`, with repeated tail spikes into `80-120ms`, `200-400ms+`, and a worst observed spike of `891ms`
- `totalMs`: `p50 ~= 62ms`
- `totalMs`: tail is driven primarily by `accessTokenSaveMs`

Representative internal timing samples:

```json
{"totalMs":52,"timings":{"validateSubjectTokenMs":2,"findAccountMs":1,"getResourceServerInfoMs":1,"grantSaveMs":5,"accessTokenSaveMs":38}}
{"totalMs":55,"timings":{"validateSubjectTokenMs":2,"findAccountMs":2,"getResourceServerInfoMs":1,"grantSaveMs":4,"accessTokenSaveMs":43}}
{"totalMs":63,"timings":{"validateSubjectTokenMs":2,"findAccountMs":2,"getResourceServerInfoMs":13,"grantSaveMs":6,"accessTokenSaveMs":36}}
{"totalMs":95,"timings":{"validateSubjectTokenMs":2,"findAccountMs":2,"getResourceServerInfoMs":1,"grantSaveMs":4,"accessTokenSaveMs":83}}
{"totalMs":231,"timings":{"validateSubjectTokenMs":1,"findAccountMs":2,"getResourceServerInfoMs":2,"grantSaveMs":18,"accessTokenSaveMs":205}}
{"totalMs":392,"timings":{"validateSubjectTokenMs":1,"findAccountMs":1,"getResourceServerInfoMs":2,"grantSaveMs":4,"accessTokenSaveMs":382}}
{"totalMs":912,"timings":{"validateSubjectTokenMs":2,"findAccountMs":1,"getResourceServerInfoMs":11,"grantSaveMs":4,"accessTokenSaveMs":891}}
```

### Azure request telemetry

For `/oidc/token` during the same benchmark window:

- request count: `113`
- request duration `p50`: `89ms`
- request duration `p95`: `465ms`
- request duration `p99`: `949ms`
- request duration average: `162.6ms`

This request-level telemetry is consistent with the internal timing result: the median path is healthy, but the tail is dominated by write-path spikes.

## 5. Conclusion

The read-path optimization is successful.

Confirmed outcomes:

- `getResourceServerInfoMs` dropped from the previous `9-15ms` range to a warm-path norm of `1-3ms`
- `findAccountMs` is also stable at low single-digit milliseconds
- the `getResourceServerInfo` hotspot is no longer the primary bottleneck

Current dominant bottleneck:

- `accessTokenSaveMs`

The main limiter for token exchange latency is now write-path persistence, especially `accessToken.save()`. The total latency tail tracks `accessTokenSaveMs` spikes directly.

## 6. Direct comparison

Before:

- `getResourceServerInfoMs`: `9-15ms`
- read-path hotspot was clearly inside resource server info resolution

After:

- `getResourceServerInfoMs`: mostly `1-3ms`
- read-path hotspot is removed
- total latency tail is now write-path dominated

## 7. Action item

Next optimization work should focus on write-path persistence, with priority on:

1. `accessTokenSaveMs`
2. remaining grant/access token persistence overhead
