---
"@logto/core": minor
"@logto/console": minor
---

run Custom JWT and Actions scripts on the consolidated script runtime

Self-hosted deployments execute Custom JWT and Actions scripts on a pooled worker-thread runner with a 5-second wall-clock deadline and a 128 MB memory budget, so a runaway or never-settling async script fails instead of hanging token issuance. Script return values must be JSON-serializable. On the Console, the Custom JWT and Actions editors show a warning that scripts are not sandboxed and run with server privileges.
