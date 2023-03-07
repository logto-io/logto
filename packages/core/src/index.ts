import { noop } from '@silverhand/essentials';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import Koa from 'koa';

import { checkAlterationState } from './env-set/check-alteration-state.js';
import SharedTenantContext from './tenants/SharedTenantContext.js';

dotenv.config({ path: await findUp('.env', {}) });

// Import after env has been configured
const { loadConnectorFactories } = await import('./utils/connectors/factories.js');
const { EnvSet } = await import('./env-set/index.js');
const { default: initI18n } = await import('./i18n/init.js');
const { tenantPool, checkRowLevelSecurity } = await import('./tenants/index.js');

try {
  const app = new Koa({
    proxy: EnvSet.values.trustProxyHeader,
  });
  await initI18n();
  await loadConnectorFactories();
  await Promise.all([
    checkRowLevelSecurity(EnvSet.queryClient),
    checkAlterationState(await EnvSet.pool),
  ]);
  const sharedContext = new SharedTenantContext();
  await sharedContext.loadStorageProviderConfig(await EnvSet.pool);

  // Import last until init completed
  const { default: initApp } = await import('./app/init.js');
  await initApp(app, sharedContext);
} catch (error: unknown) {
  console.error('Error while initializing app:');
  console.error(error);

  await tenantPool.endAll().catch(noop);
}
