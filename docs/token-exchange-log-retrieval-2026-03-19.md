# Token Exchange Timing Log Retrieval

Date: 2026-03-19  
Owner: Core/OIDC

## 1. Goal

This document records the working procedure for retrieving internal token exchange timing logs from Azure.

Use this workflow when a benchmark has already been deployed and we need the internal timing fields such as:

- `totalMs`
- `timings.getResourceServerInfoMs`
- `timings.findAccountMs`
- `timings.grantSaveMs`
- `timings.accessTokenSaveMs`

## 2. Working conclusion

The reliable path is:

1. Use Azure Application Insights `requests` data to identify the actual backend that handled `/oidc/token`
2. Attach a live Azure Web App log stream to that backend with `az webapp log tail`
3. Rerun a warm benchmark and read `oidc.token_exchange_timing` directly from the live stream

This is the shortest working path that was verified in practice.

## 3. Verified environment

Benchmark entrypoint:

- `https://sxkxgo.app.logto.dev/oidc/token`

Azure resources observed during the successful run:

- resource group: `LogtoDev`
- Application Insights app: `logto-dev`
- effective backend: `logto-dev-eu.azurewebsites.net`
- Azure Web App name used for live tail: `logto-dev-eu`

## 4. Step 1: identify the actual backend

Do not assume the public tenant domain is the actual app instance. First query Application Insights `requests` for `/oidc/token`.

Example:

```bash
az monitor app-insights query \
  -a logto-dev \
  -g LogtoDev \
  --start-time '2026-03-19 08:41:00+00:00' \
  --end-time '2026-03-19 08:45:00+00:00' \
  --analytics-query "
    requests
    | where url contains \"/oidc/token\"
    | project timestamp, name, url, resultCode, success, duration, operation_Id
    | order by timestamp asc
  " \
  -o json
```

What to look for:

- the `url` field in the returned rows
- the actual backend host, not the public tenant hostname

In the successful run, this query showed requests hitting:

- `https://logto-dev-eu.azurewebsites.net/oidc/token`

## 5. Step 2: attach live log tail to the actual backend

Once the backend Web App is known, attach a live log stream to that app.

Example:

```bash
az webapp log tail -g LogtoDev -n logto-dev-eu
```

Keep this command running in a dedicated terminal while the benchmark is executing.

Expected log lines include:

- `oidc.token_exchange_request`
- `oidc.token_exchange_timing`

## 6. Step 3: rerun a clean warm benchmark

For timing analysis, prefer a warm-only sequential run instead of mixing warm, cold, and concurrent traffic in the same window.

Recommended shape:

- same client
- same user subject token
- same `resource`
- `resource` must be included in the request
- sequential warm requests

Example:

```bash
TOKEN_ENDPOINT='https://sxkxgo.app.logto.dev/oidc/token' \
CLIENT_ID='<client-id>' \
CLIENT_SECRET='<client-secret>' \
SUBJECT_TOKEN='<subject-access-token>' \
RESOURCE='<resource-indicator>' \
SCOPE='<scope>' \
WARM_RUNS=100 \
COLD_RUNS=1 \
COLD_SLEEP_SECONDS=1 \
CONCURRENT_TOTAL=1 \
CONCURRENT_JOBS=1 \
bash scripts/token-exchange-benchmark.sh
```

If the client is public, omit `CLIENT_SECRET`.

## 7. Step 4: extract the internal timing data

Read `oidc.token_exchange_timing` from the live stream and extract:

- `totalMs`
- `timings.getResourceServerInfoMs`
- `timings.findAccountMs`
- `timings.grantSaveMs`
- `timings.accessTokenSaveMs`

Representative log shape:

```json
{
  "event": "oidc.token_exchange_timing",
  "totalMs": 52,
  "timings": {
    "validateSubjectTokenMs": 2,
    "findAccountMs": 1,
    "getResourceServerInfoMs": 1,
    "grantSaveMs": 5,
    "accessTokenSaveMs": 38
  }
}
```

These internal timing logs are the primary source of truth for optimization verification.

## 8. What not to do

Avoid these paths for this task:

- do not use external client-side latency as the optimization result
- do not assume Application Insights `traces` contains `oidc.token_exchange_timing`
- do not start from the public tenant domain and assume it maps directly to the correct Azure Web App

During the verified run:

- Application Insights `requests` was useful for locating the actual backend
- Application Insights `traces` did not contain the internal timing event
- live tail from the actual Azure Web App was the reliable source

## 9. Minimal checklist

Before running:

- confirm timing log output is enabled in the deployment
- confirm the benchmark request includes `resource`
- confirm the benchmark uses the same client, subject token, and resource for warm-cache measurement

During retrieval:

1. query Application Insights `requests`
2. identify the actual Azure backend hostname
3. map that backend to the Azure Web App name
4. run `az webapp log tail`
5. rerun the warm benchmark
6. record `oidc.token_exchange_timing`

This is the workflow that should be reused next time.
