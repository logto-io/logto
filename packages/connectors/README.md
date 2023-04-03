# Logto connectors directory

## Template syncing

Since all connectors have a same pattern for `package.json`, here we leverage several techniques to avoid annoying copy-pastes:

### When `pnpm i`

- The `"pnpm:devPreinstall"` script in the project root executes `templates/sync-preset.js` that:
  - Check every connectors's `package.json` to see if there's any unexpected keys
  - Sync `templates/package.json` by REPLACING every template key (except dependency keys) in the current `package.json` with the value from the template `package.json`
  - Copies all config files to every connector directory
- The hook in `.pnpmfile.cjs` of the project root merges dependency fields for every connector
  - Also we can update arbitrary fields in this hook, we still need to keep non-dependency fields in the connector's `package.json` since the hook only takes affect during `pnpm i`.

> **Caution**
> Workspace dependencies should be defined in connector's package.json (not template) in order to let PNPM correctly resolves the workspace dependency tree;

### Add a new custom field

Head to `templates/sync-preset.js` and update `allowedCustomKeys`.
