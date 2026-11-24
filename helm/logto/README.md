# Logto Helm chart (experimental)

This chart installs Logto, not PostgreSQL. Supply a dedicated, reachable PostgreSQL database and
an existing Kubernetes Secret in the release namespace containing its connection URL under `DB_URL`
(configurable with `database.secretKey`). Pass the Secret's **name**, not the URL, to Helm. Logto
needs permission to create PostgreSQL roles; check this with your managed database provider first.

## Install

For a fresh, empty database:

```sh
helm install logto ./helm/logto --namespace logto --wait --timeout 5m \
  --set database.existingSecret=logto-db \
  --set database.seedOnInstall=true
```

Leave `seedOnInstall` disabled for an existing database. The seed Job uses `--swe` (skip when the
Logto config table exists); it does not upgrade an older database. Apply any required alterations
with the target image before installing against an existing database. Otherwise, new Pods may
fail the startup schema checks. The seed option runs one Helm hook Job before creating the Deployment,
not an init container that runs in every replica. The default Pod runs as a non-root user and has
a writable, Pod-local directory for the alteration scripts that Logto copies at startup.
Containers use a read-only root filesystem by default. `/tmp` (including the npm cache) and the
alteration-scripts directory are writable. If a custom image needs another writable path, adapt the
image or set `securityContext.readOnlyRootFilesystem=false`.

For a local check without Ingress:

```sh
kubectl -n logto port-forward svc/logto 3001:3001 3002:3002
curl -fsS http://localhost:3001/api/status
curl -fsS http://localhost:3001/oidc/.well-known/openid-configuration
```

Startup and readiness use `/api/status` on the core port (3001). That route can depend on
PostgreSQL, so liveness only checks whether the core TCP listener is open. An outage can make
Pods unready without liveness restarting them. No probe checks the Admin Console listener on
port 3002; monitor it separately if you expose it.

For Ingress, use a controller already installed in the cluster and provide the public origins.
The origins must use the matching host and `http` or `https`, with no explicit port, path, or
trailing slash:

```yaml
endpoint: https://login.example.com
adminEndpoint: https://admin.example.com
trustProxyHeader: true
ingress:
  enabled: true
  className: nginx
  host: login.example.com
  adminHost: admin.example.com
  tls:
    - secretName: logto-tls
      hosts: [login.example.com, admin.example.com]
```

Enable proxy header trust only if a trusted proxy sanitizes incoming forwarded headers and clients
cannot reach Logto directly. Omit `ingress.adminHost` if Admin Console should not be exposed through
this Ingress. That does not disable Admin Console on the internal Service. To disable it entirely,
leave `adminEndpoint` unset and set `ADMIN_DISABLE_LOCALHOST` to `"1"` via `extraEnv`. Do not override
`PORT` or `ADMIN_PORT` via `extraEnv`; the Service and probes use the default ports.

Use the same image and connector set on all replicas; bake custom connectors into a compatible
image rather than modifying individual Pods. This chart does not install connectors at runtime.

## Optional Redis cache

Redis is disabled by default (`redis.mode=disabled`). Logto still uses PostgreSQL as its database.
Redis is only a [shared cache](https://docs.logto.io/logto-oss/central-cache).

- **Bundled** (`redis.mode=bundled`): deploys one password-protected Redis Pod and a ClusterIP
  Service. Create a Secret in the release namespace containing `REDIS_PASSWORD` (or the key from
  `redis.passwordKey`), then set `redis.existingSecret` to its name. Use a long random password
  made only of letters, digits, `_`, and `-` so it can be used in the connection URL. This cache
  has no persistence, HA, or TLS. Restrict its network access to trusted workloads, and use an
  existing Redis service if you need TLS or HA. Restart both deployments after rotating the Secret.
- **External** (`redis.mode=external`): set `redis.existingSecret` to a Secret containing the
  Redis connection URL under `REDIS_URL` (or `redis.urlKey`). Use `rediss://` for TLS, and
  percent-encode special characters in the credentials. No Redis Pods are created by the chart.

Only the Logto application Pods receive the Redis configuration, not the database Jobs. If you
already set `REDIS_URL` through `extraEnv`, keep `redis.mode=disabled` or move that setting into
the Redis Secret configuration; do not use both.

## Pod configuration

`extraEnv` applies only to Logto application Pods; use `database.extraEnv` for seed and migration
Jobs. Both accept Kubernetes `EnvVar` entries, including `valueFrom` for Secret references. Use
`database.existingSecret` and `database.secretKey` to configure `DB_URL` for both.

`nodeSelector`, `tolerations`, `affinity`, `podAnnotations`, `serviceAccountName` and
`imagePullSecrets` apply to application, database Job, and bundled Redis Pods. Use label selectors
in affinity rules if you only want them to match one workload. Provide an existing ServiceAccount
in the release namespace if you set a name. The
chart disables automatic ServiceAccount token mounts. Workload identity injection by the platform
may still work independently of that setting.

Set `podDisruptionBudget.enabled=true` to limit voluntary evictions when the fixed replica count
or HPA minimum is at least two (`podDisruptionBudget.maxUnavailable` defaults to `1`). It does not
govern Deployment rollouts or protect against involuntary outages.

## Optional autoscaling

The Horizontal Pod Autoscaler (HPA) is disabled by default. To enable CPU-based scaling, make
sure the cluster exposes `metrics.k8s.io` (for example via Metrics Server) and set a CPU request:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 70
resources:
  requests:
    cpu: 250m
```

When enabled, the HPA manages the Logto Deployment's replica count instead of `replicaCount`.
Size the CPU request with load tests and cap `maxReplicas` to fit the PostgreSQL connection
budget. When enabling the HPA on an existing release, plan for a possible brief drop to one
replica as Helm removes the fixed replica count. For a database upgrade that requires downtime,
disable autoscaling first so the HPA cannot restore the old Pods before the migration.

## PostgreSQL connection budget

Each Logto Pod uses one shared pool plus one pool per loaded tenant. The default pool limit is
`DATABASE_POOL_SIZE=20` for each pool. With both OSS tenants (`default` and `admin`) loaded, the
configured ceiling is `(1 + 2) × 20 = 60` connections per Pod, or 300 for five Pods. These are
configured limits, not measurements of concurrent connections. Budget for peak live Pods,
including rolling-update surge; reserve additional capacity for the migration Job (which uses
its own CLI pool), PostgreSQL reserved connections, and other clients. Check your server's
`max_connections` and use `pg_stat_activity` under representative load to check actual usage.

For example, to cap the application pools at 5 connections each (up to 75 across five standard
OSS Pods, before surge or other clients), tune the application environment:

```yaml
extraEnv:
  - name: DATABASE_POOL_SIZE
    value: "5"
```

## Upgrade

Read the [Logto upgrade guide](https://docs.logto.io/logto-oss/upgrading-oss-version), back up the
database, and pin the target image version. Pass your values file when upgrading, or use
`--reset-then-reuse-values` (Helm 3.14 or later) to carry forward your overrides while picking up new
defaults. When the database is not migrated externally,
`database.migrateOnUpgrade=true` runs a single pre-upgrade Job from the target image and blocks
the rollout if it fails. Do not run overlapping upgrades or manage the same database with multiple
releases running schema hooks. A Helm rollback does **not** roll back the database. If a Job fails,
inspect its logs and database state before retrying. The Job does not retry failed Pods, but
rerunning Helm can create another Job. GitOps tools that only render Helm templates
should run seed and migrations separately unless they implement the required Helm hook lifecycle.

The hook migrates the database **while the old Pods are still running**. The default `RollingUpdate`
strategy also briefly runs both application versions together. Logto's upgrade guide describes
alterations as compatible with the **previous** version; verify the exact upgrade path, especially
if skipping releases. `strategy.type=Recreate` avoids overlap during the application rollout, but
does **not** stop old Pods before the pre-upgrade hook runs. If the migration is incompatible with
running old Pods (or compatibility is unknown), schedule downtime: suspend any reconciler or
autoscaler that would restore replicas, scale the old Deployment to zero and wait for its Pods to
exit, then run `helm upgrade` with the desired replica count.

With `migrateOnUpgrade=false`, apply all required alterations using the target image before
upgrading. Logto refuses to start on a schema with missing alterations or required row-level
security. This is especially important with `Recreate`: the old Pods are already gone when the
new Pods start, so an unmigrated schema can take the entire service offline.

## Testing the chart

The [Helm workflow](../../.github/workflows/helm-test.yml) lints the chart and runs its template
unit tests in `tests/`, then
installs a separate test-only PostgreSQL chart into a fresh kind cluster. It then installs Logto
with `ci/smoke-values.yaml` to exercise the external database and pre-install seed Job. It verifies database seed and
startup, the core health endpoint, OIDC discovery, and the Admin Console welcome redirect. It
does not test Ingress, TLS, optional Redis at runtime, or a database upgrade.
It uses the published image pinned by `Chart.yaml`'s `appVersion`, not an image built from the PR.
Changes to the Dockerfile or runtime write paths require separate testing with a locally built
image, especially under the chart's non-root and read-only defaults. Before publishing this chart,
agree with maintainers on keeping `appVersion` aligned with released `@logto/core` image tags.

To run the template tests locally, install the same plugin version as CI and run:

```sh
helm plugin install https://github.com/helm-unittest/helm-unittest --version 1.0.3
helm unittest --strict helm/logto
```

To run the same smoke test locally with Docker, kind, kubectl, and Helm installed, run
`bash .scripts/helm/smoke.sh` from the repository root. The script uses a separate kubeconfig and
deletes only the cluster it creates.
