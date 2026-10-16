import { createPool } from '@silverhand/slonik';

import { createAudit } from './audit.js';
import { createVerifier } from './auth.js';
import { type PortalConfig, loadConfig } from './config.js';
import { createPortalHttpServer } from './http.js';
import { PostgresUpstreamStore, migratePostgresUpstreams } from './postgres-registry.js';
import { JsonFileUpstreamStore, type UpstreamStore } from './registry.js';
import {
  JsonFileSettingsStore,
  migratePostgresSettings,
  PostgresSettingsStore,
  type SettingsStore,
} from './settings.js';
import { PortalSetup } from './setup.js';
import { UpstreamPool } from './upstream-pool.js';

type Storage = { store: UpstreamStore; settings: SettingsStore };

const createStorage = async (config: PortalConfig): Promise<Storage> => {
  if (!config.databaseUrl) {
    const fileStore = new JsonFileUpstreamStore(config.registryPath);
    await fileStore.load();

    return {
      store: fileStore,
      settings: new JsonFileSettingsStore(`${config.registryPath}.settings`),
    };
  }

  const pool = await createPool(config.databaseUrl);
  await migratePostgresUpstreams(pool);
  await migratePostgresSettings(pool);

  return {
    store: new PostgresUpstreamStore(pool),
    settings: new PostgresSettingsStore(pool),
  };
};

const config = loadConfig();
const { store, settings } = await createStorage(config);
const setup = await PortalSetup.create(settings);

const setupToken = setup.pendingToken();

if (setupToken) {
  // Printed once per start while unconfigured. The admin enters it in the Logto console.
  process.stdout.write(
    `MCP portal is not configured. Setup token: ${setupToken}\n` +
      'Enter this token in the Logto console under MCP servers to finish setup.\n'
  );
}

const server = createPortalHttpServer({
  verify: createVerifier({
    issuer: config.oidcIssuer,
    audience: config.audience,
    requiredScope: config.requiredScope,
  }),
  registry: store,
  setup,
  pool: new UpstreamPool(),
  audit: createAudit(),
});

server.listen(config.port, () => {
  process.stdout.write(`MCP portal listening on port ${config.port}\n`);
});
