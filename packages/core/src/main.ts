import { appInsights } from '@logto/app-insights/node';
import { ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import Koa from 'koa';

import initApp from './app/init.js';
import { redisCache } from './caches/index.js';
import { EnvSet } from './env-set/index.js';
import { checkPreconditions } from './env-set/preconditions.js';
import initI18n from './i18n/init.js';
import SystemContext from './tenants/SystemContext.js';
import { tenantPool } from './tenants/index.js';
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
    checkPreconditions(sharedAdminPool),
    SystemContext.shared.loadProviderConfigs(sharedAdminPool),
  ]);

  /**
   * Catch unhandled promise rejections and log them to Application Insights.
   * The unhandled promise rejection was first observed in the `TenantPool.get()` method.
   *
   * In this method, if the `tenantId` is not found, `Tenant.create()` will throw an error.
   * We use a try-catch block to catch the error and throw it with logging.
   * However, if the `Tenant.create()` Promise is read from the cache, somehow the error is not caught.
   * The root cause of this error is still unknown. To avoid the app from crashing, we catch the error here.
   *
   * @see TenantPool.get
   */
  process.on('unhandledRejection', (error) => {
    consoleLog.error(error);
    void appInsights.trackException(error);
  });

  await initApp(app);
} catch (error: unknown) {
  consoleLog.error('Error while initializing app:');
  consoleLog.error(error);

  void Promise.all([trySafe(tenantPool.endAll()), trySafe(redisCache.disconnect())]);
}
