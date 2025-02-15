---
"@logto/cli": patch
---

fix cli add offical connectors command missing connectors bug

Fix the bug when running the cli commend `logto connectors add --official`, only 8 connectors are fetched from npm registry.
This fix update logic to query additional pages of results when fetching connectors from the npm registry.
