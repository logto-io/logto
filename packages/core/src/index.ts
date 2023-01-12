import { noop } from '@silverhand/essentials';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import Koa from 'koa';

import initI18n from './i18n/init.js';

dotenv.config({ path: await findUp('.env', {}) });

// Import after env has configured

const { loadConnectorFactories } = await import('./utils/connectors/factories.js');
const { EnvSet } = await import('./env-set/index.js');
const { tenantPool } = await import('./tenants/index.js');

try {
  const app = new Koa({
    proxy: EnvSet.values.trustProxyHeader,
  });
  await initI18n();
  await loadConnectorFactories();

  // Import last until init completed
  const { default: initApp } = await import('./app/init.js');
  await initApp(app);
} catch (error: unknown) {
  console.error('Error while initializing app:');
  console.error(error);

  await tenantPool.endAll().catch(noop);
}
