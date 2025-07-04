set -e

docker compose -f ../../docker-compose.yml -f ./docker-compose.local.yml up -d

timeout=60
interval=5
elapsed=0

while ! curl -sf http://localhost:3001/api/status > /dev/null; do
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Timed out waiting for API to be healthy."
    exit 1
  fi
  echo "Waiting for API to be healthy..."
  sleep $interval
  elapsed=$((elapsed + interval))
done

pnpm exec openapi-typescript http://localhost:3001/api/.well-known/management.openapi.json --output src/generated-types/management.ts
docker compose down
