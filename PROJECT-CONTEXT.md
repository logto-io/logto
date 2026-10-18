# Project Context

## Project
`einyx/logto` is a customized self-hosted identity platform based on Logto, extended with MeshX/Kubo UI, MCP portal, and multi-tenant capabilities.

## Tech stack
TypeScript monorepo, Koa backend, React console/account UI, PostgreSQL, pnpm, Docker, Kubernetes/kind, and Caddy.

## Current phase
The custom fork is deployed at `auth.hardening.dev`. The internal WAF package and early Koa integration are implemented on `feat/internal-waf`; production still runs the pre-WAF image pending a report-only canary.

## Constraints
- Only `https://github.com/einyx/logto.git` is an approved Git remote.
- Preserve OIDC, callback, admin-console, MCP, and multi-tenant behavior.
- Build and test with Node.js 22 and the repository-supported pnpm version.
- WAF begins in report-only mode and must fail safely.
- Never log request bodies, credentials, cookies, authorization headers, or tokens.
- Production changes require isolated build/test verification before rollout.

## Definition of done
A tested internal WAF package runs as early Koa middleware, detects bounded high-confidence threats, supports report-only and blocking modes, produces sanitized structured events, preserves legitimate authentication flows, and passes the monorepo build and focused security tests before deployment.

## Internal WAF operations
- Admin Console → Security → WAF stores runtime policy without a restart.
- `report` is the default and the only approved initial production mode.
- `off` in the UI is the kill switch.
- `block` requires separate approval after report-only evidence review.
- Events contain request ID, method, rule ID, mode, and target length only.
- The package does not replace an edge WAF and does not scan request bodies.
