#!/usr/bin/env bash
set -eu

cd /etc/logto

npm run cli db seed -- --test --swe
npm run cli connector list -- -p . | grep OFFICIAL
npm run cli connector link -- --mock -p .
npm run cli db system set cloudflareHostnameProvider '{"zoneId":"mock-zone-id","apiToken":""}'

exec npm start
