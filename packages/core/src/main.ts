import { appInsights } from '@logto/app-insights/node';
import { ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import Koa from 'koa';

import initApp from './app/init.js';
import { redisCache } from './caches/index.js';
import { checkAlterationState } from './env-set/check-alteration-state.js';
import { EnvSet } from './env-set/index.js';
import initI18n from './i18n/init.js';
import SystemContext from './tenants/SystemContext.js';
import { checkRowLevelSecurity, tenantPool } from './tenants/index.js';
import { loadConnectorFactories } from './utils/connectors/index.js';

const consoleLog = new ConsoleLog(chalk.magenta('index'));

if (await appInsights.setup('core')) {
  consoleLog.info('Initialized ApplicationInsights');
}

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
    SystemContext.shared.loadProviderConfigs(sharedAdminPool),
  ]);

  await initApp(app);
} catch (error: unknown) {
  consoleLog.error('Error while initializing app:');
  consoleLog.error(error);

  void Promise.all([trySafe(tenantPool.endAll()), trySafe(redisCache.disconnect())]);
}
