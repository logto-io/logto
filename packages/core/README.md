# @logto/core

The core backend service.

## Get started

Copy proper `.env` to project root. (TBD: design the config process)

```bash
pnpm i && pnpm dev
```

## OpenAPI documentation

OpenAPI (Swagger) json is available on `http(s)://your-domain/api/swagger.json`. If you are running locally, the default URL will be `http://localhost:3001/api/swagger.json`. Consume it in the way you like.

### Using ReDoc

The doc website can be served by [redoc-cli](https://github.com/Redocly/redoc/blob/master/cli/README.md) in an extremely easy way:

```bash
npx redoc-cli serve http://localhost:3001/api/swagger.json
```

### Using Swagger editor

Copy the API output and paste it in the [Swagger Editor](https://editor.swagger.io/).

## Inline Hook operational telemetry

Core emits two Application Insights custom metrics for every Inline Hook script execution:

| Metric name                              | Value                                   |
| ---------------------------------------- | --------------------------------------- |
| `core/inline_hook/execution_count`       | `1` per actual script execution         |
| `core/inline_hook/execution_duration_ms` | Script execution duration, milliseconds |

Both metrics carry the same low-cardinality dimensions:

| Dimension         | Values                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `hookType`        | `PostFirstFactorVerification`, `PostSignIn`                      |
| `runtimeLocation` | `local`, `azure`                                                 |
| `outcome`         | `success`, `executionError`, `invalidResult`, `noop`, `fallback` |
| `action`          | `createUser`, `updateUser`, `noop`                               |

`executionError` includes both allowed and blocking execution failures. `noop` covers an
intentional P2 no-result return, while `fallback` covers the equivalent P1 result that falls back
to invalid credentials. Malformed or unsupported non-empty results use `invalidResult`. Disabled,
missing, quota-disabled, and development-gated hooks do not emit execution metrics.
Outcomes describe the script execution and returned contract; downstream database writes are not
part of these metrics.

Execution exceptions use the same four low-cardinality dimensions as Application Insights
properties. Metric dimensions and exception properties never include hook scripts,
environment-variable values, passwords, tenant or user IDs, or other request-specific identifiers.
Exception messages are sanitized to redact scripts, passwords, environment-variable values, and
sensitive event fields before reporting.
