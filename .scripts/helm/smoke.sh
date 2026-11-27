#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
work_dir=$(mktemp -d "${TMPDIR:-/tmp}/logto-helm-smoke.XXXXXX")
export KUBECONFIG="$work_dir/kubeconfig"
cluster="logto-helm-$$"
namespace=logto-smoke
k=(kubectl --context "kind-$cluster" --namespace "$namespace")
h=(helm --kube-context "kind-$cluster" --namespace "$namespace")

cleanup() {
  local status=$?
  if (( status != 0 )) && [[ -s "$KUBECONFIG" ]]; then
    "${k[@]}" get pods,jobs,services -o wide || true
    "${k[@]}" get events --sort-by=.lastTimestamp || true
    "${k[@]}" logs deployment/postgres --tail=80 || true
    "${k[@]}" logs deployment/logto --tail=80 || true
    "${k[@]}" logs job/logto-seed --tail=80 || true
  fi
  kind delete cluster --name "$cluster" || true
  rm -f -- "$KUBECONFIG" "$work_dir/postgres-password"
  rmdir -- "$work_dir" || true
}
trap cleanup EXIT

kind create cluster --name "$cluster" --kubeconfig "$KUBECONFIG" --wait 120s
"${k[@]}" create namespace "$namespace"
"${k[@]}" label namespace "$namespace" pod-security.kubernetes.io/enforce=restricted

(umask 077; password=$(openssl rand -hex 24); printf '%s' "$password" > "$work_dir/postgres-password")
"${h[@]}" install test-postgresql "$repo_root/.scripts/helm/test-postgresql" \
  --set-file "password=$work_dir/postgres-password" --wait --timeout 2m
rm -f -- "$work_dir/postgres-password"

"${h[@]}" install logto "$repo_root/helm/logto" \
  -f "$repo_root/helm/logto/ci/smoke-values.yaml" --wait --timeout 4m

"${k[@]}" exec -i deployment/logto -- node --input-type=module - <<'JS'
import assert from 'node:assert/strict';

const get = (port, path) =>
  fetch(`http://logto:${port}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
assert.equal((await get(3001, '/api/status')).status, 204);
const discovery = await get(3001, '/oidc/.well-known/openid-configuration');
assert.equal(discovery.status, 200);
const { issuer, jwks_uri } = await discovery.json();
assert.equal(issuer, 'http://logto:3001/oidc');
assert.equal(new URL(jwks_uri).origin, new URL(issuer).origin);

const admin = await get(3002, '/');
assert.equal(admin.status, 302);
assert.equal(admin.headers.get('location'), '/console/welcome');
console.log('Logto smoke passed: health, OIDC discovery, and admin welcome redirect');
JS
