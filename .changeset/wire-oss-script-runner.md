---
"@logto/core": minor
---

run Custom JWT and Actions scripts on pooled worker threads in OSS deployments

Self-hosted (OSS) Custom JWT and Actions scripts no longer execute through `node:vm` on the main thread. Each script now runs on a pooled worker thread with a hard resource budget:

- A 5-second wall-clock deadline covers the whole run, including asynchronous work. Previously only synchronous execution was bounded (3 seconds up to the first `await`), so an async script — for example one awaiting a promise that never settles — could hang token issuance forever. A script whose async work exceeds the deadline now fails with a timeout error instead.
- Script memory is budgeted at 128 MB of V8 heap per worker.
- A runaway script (infinite loop, runaway allocation, `process.exit()`) is terminated and reported as an error; it can no longer hang or crash the Logto core process, and the main event loop stays responsive throughout.
- Scripts run in a real Node.js worker environment with the standard runtime globals (such as `process`, `Buffer`, and `setTimeout`) and accurate stack traces. This runtime is intentionally not a security sandbox — see the sandbox warning on the script-editing pages in Console.
- Script return values must be JSON-serializable. A value that cannot cross the worker boundary (such as a function) is reported as an error instead of being silently passed through. For Custom JWT this specific case was previously reported as a 400 `Invalid input`; it is now a 422 with the message above.
- A script is evaluated once per pooled worker and the worker is reused across invocations of the same script text, so top-level (module-scope) state persists between runs instead of being reset on every invocation. Workers are keyed by script content: dry runs and production runs of a byte-identical script share a worker.
- Concurrent invocations of the same script share its worker. When one run breaches its deadline or memory budget the worker is terminated, so in-flight runs of that same script fail with it and are retried on a fresh worker on the next invocation.

Other error semantics at the API surface are unchanged: `api.denyAccess()` still results in 403, syntax and type errors in 422, and runtime failures in 500.
