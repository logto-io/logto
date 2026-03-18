#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-api}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.integration.yml"
SERVICE_NAME="logto"
RUN_ID="$(date +%s)-$$"
LOG_DIR="${REPO_ROOT}/logs"
LOG_PREFIX="${LOG_DIR}/integration-log-${RUN_ID}"
MOCK_MESSAGE_DIR="${REPO_ROOT}/.integration-test-tmp"

echo "starting ${TARGET} integration test with run id: ${RUN_ID}"

mkdir -p "$LOG_DIR"

# A function to dump logs of the services to files for debugging purposes
dump_logs() {
  docker compose -f "$COMPOSE_FILE" logs logto > "${LOG_PREFIX}-logto.log" 2>&1 || true
  docker compose -f "$COMPOSE_FILE" logs postgres > "${LOG_PREFIX}-postgres.log" 2>&1 || true
  docker compose -f "$COMPOSE_FILE" logs redis > "${LOG_PREFIX}-redis.log" 2>&1 || true
}

# A function to clean up the environment after the tests regardless of the test result
cleanup() {
  local exit_code=$?

  echo
  echo "writing logs with run id: ${RUN_ID}"
  dump_logs

  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans

  if [ "$exit_code" -ne 0 ]; then
    echo "integration test failed"
    echo "log files:"
    echo "  ${LOG_PREFIX}-logto.log"
    echo "  ${LOG_PREFIX}-postgres.log"
    echo "  ${LOG_PREFIX}-redis.log"
  fi

  exit "$exit_code"
}

trap cleanup EXIT

mkdir -p "$MOCK_MESSAGE_DIR"
# Remove any existing mock message files
# Note: We don't use `rm -rf` because we'd like to keep the directory itself for a stable mount
# point in the docker container.
find "$MOCK_MESSAGE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

# Stop and remove any existing containers from previous runs to ensure a clean environment
docker compose -f "$COMPOSE_FILE" down -v --remove-orphans

# Start the services defined in the docker-compose file
COMPOSE_UP_ARGS=(-d --wait)

if [ -z "${NO_BUILD:-}" ]; then
  COMPOSE_UP_ARGS=(--build "${COMPOSE_UP_ARGS[@]}")
else
  echo "skipping build as NO_BUILD is set"
fi

docker compose -f "$COMPOSE_FILE" up "${COMPOSE_UP_ARGS[@]}"

# Build and run the integration tests
cd "${REPO_ROOT}/packages/integration-tests"
pnpm build

MOCK_CONNECTOR_MESSAGE_DIR="$MOCK_MESSAGE_DIR" \
WEBHOOK_HOST_FOR_APP="host.docker.internal" \
pnpm run "test:${TARGET}"
