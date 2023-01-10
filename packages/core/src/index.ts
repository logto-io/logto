import { noop } from '@silverhand/essentials';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import Koa from 'koa';

import initI18n from './i18n/init.js';

dotenv.config({ path: await findUp('.env', {}) });

// Import after env has configured
const { default: envSet } = await import('./env-set/index.js');
await envSet.load();

const { loadConnectorFactories } = await import('./utils/connectors/factories.js');

try {
  const app = new Koa({
    proxy: envSet.values.trustProxyHeader,
  });
  await initI18n();
  await loadConnectorFactories();

  // Import last until init completed
  const { default: initApp } = await import('./app/init.js');
  await initApp(app);
} catch (error: unknown) {
  console.error('Error while initializing app:');
  console.error(error);

  await Promise.all([envSet.poolSafe?.end(), envSet.queryClientSafe?.end()]).catch(noop);
}
