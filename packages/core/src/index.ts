import { trySafe } from '@silverhand/essentials';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import Koa from 'koa';

import { checkAlterationState } from './env-set/check-alteration-state.js';
import SystemContext from './tenants/SystemContext.js';

dotenv.config({ path: await findUp('.env', {}) });

const { appInsights } = await import('@logto/app-insights/node');

if (await appInsights.setup('logto')) {
  console.debug('Initialized ApplicationInsights');
}

// Import after env has been configured
const { loadConnectorFactories } = await import('./utils/connectors/index.js');
const { EnvSet } = await import('./env-set/index.js');
const { redisCache } = await import('./caches/index.js');
const { default: initI18n } = await import('./i18n/init.js');
const { tenantPool, checkRowLevelSecurity } = await import('./tenants/index.js');

try {
  const app = new Koa({
    proxy: EnvSet.values.trustProxyHeader,
  });
  const sharedAdminPool = await EnvSet.sharedPool;

  await Promise.all([
    initI18n(),
    redisCache.connect(),
    loadConnectorFactories(),
    checkRowLevelSecurity(sharedAdminPool),
    checkAlterationState(sharedAdminPool),
    SystemContext.shared.loadStorageProviderConfig(sharedAdminPool),
  ]);

  // Import last until init completed
  const { default: initApp } = await import('./app/init.js');
  await initApp(app);
} catch (error: unknown) {
  console.error('Error while initializing app:');
  console.error(error);

  await Promise.all([trySafe(tenantPool.endAll()), trySafe(redisCache.disconnect())]);
}
