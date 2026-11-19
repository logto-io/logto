import { appInsights } from '@logto/app-insights/node';
import { installGracefulShutdown, withTimeout } from '@logto/job-queue';
import { ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import Koa from 'koa';

import initApp from './app/init.js';
import { redisCache } from './caches/index.js';
import { EnvSet } from './env-set/index.js';
import { checkPreconditions } from './env-set/preconditions.js';
import initI18n from './i18n/init.js';
import { jobQueue } from './job-queue/index.js';
import SystemContext from './tenants/SystemContext.js';
import { tenantPool } from './tenants/index.js';
import { loadConnectorFactories } from './utils/connectors/index.js';
import { shutdownPostHog } from './utils/posthog.js';

const consoleLog = new ConsoleLog(chalk.magenta('index'));

/**
 * Azure App Service sends `SIGKILL` 5 seconds after `SIGTERM`. Closing servers and draining
 * in-flight jobs and enqueues, releasing jobs left claimed, and closing pools add up to 4.3 s.
 */
const shutdownDrainTimeoutMs = 3500;
const shutdownReleaseTimeoutMs = 300;
const shutdownCleanupTimeoutMs = 500;
/** How often a closing server drops connections whose response finished after `close()`. */
const idleConnectionSweepMs = 100;

if (await appInsights.setup('core')) {
  consoleLog.info('Initialized ApplicationInsights');
}

const startCore = async () => {
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

    const servers = await initApp(app);

    // Durable job queue: the worker only runs with dev features on.
    if (EnvSet.values.isDevFeaturesEnabled) {
      jobQueue.start(sharedAdminPool);
    }

    return servers;
  } catch (error: unknown) {
    consoleLog.error('Error while initializing app:');
    consoleLog.error(error);

    void Promise.all([
      trySafe(tenantPool.endAll()),
      trySafe(redisCache.disconnect()),
      shutdownPostHog(),
    ]);

    return [];
  }
};

const servers = await startCore();

if (EnvSet.values.isIntegrationTest) {
  consoleLog.info(`pid=${process.pid}`);
}

/** Stop accepting connections and resolve once every open request has finished. */
const closeServer = async (server: (typeof servers)[number]) =>
  new Promise<void>((resolve) => {
    // `close()` drops only connections idle at that moment; a keep-alive connection whose
    // response finishes later would hold the server open until its keep-alive timeout.
    const idleSweep =
      'closeIdleConnections' in server
        ? setInterval(() => {
            server.closeIdleConnections();
          }, idleConnectionSweepMs)
        : undefined;

    server.close(() => {
      clearInterval(idleSweep);
      resolve();
    });
  });

// Durable job queue: graceful shutdown replaces the integration-test-only exit once released.
if (EnvSet.values.isDevFeaturesEnabled) {
  // eslint-disable-next-line @silverhand/fp/no-let -- created once by the first shutdown step
  let serversClosed: Promise<unknown> | undefined;
  const closeServers = async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- `close` and `drain` share one close
    serversClosed ??= Promise.all(servers.map(async (server) => closeServer(server)));
    return serversClosed;
  };

  installGracefulShutdown({
    // Requests still running can enqueue jobs, so enqueues drain after the servers close.
    drain: async () => jobQueue.drain(closeServers()),
    drainTimeoutMs: shutdownDrainTimeoutMs,
    onDrainTimeout: async () =>
      withTimeout(
        jobQueue.releaseClaimed(),
        shutdownReleaseTimeoutMs,
        'Timed out releasing claimed jobs.'
      ),
    close: async () =>
      withTimeout(closeServers(), shutdownDrainTimeoutMs, 'Timed out closing HTTP servers.'),
    cleanup: async () =>
      withTimeout(
        Promise.all([
          trySafe(tenantPool.endAll()),
          trySafe(async () => {
            const sharedPool = await EnvSet.sharedPool;
            await sharedPool.end();
          }),
          trySafe(redisCache.disconnect()),
          shutdownPostHog(),
        ]),
        shutdownCleanupTimeoutMs,
        'Timed out closing database pools.'
      ),
    log: consoleLog,
  });
} else if (EnvSet.values.isIntegrationTest) {
  // eslint-disable-next-line @silverhand/fp/no-let
  let isExiting = false;

  const gracefullyExit = () => {
    if (isExiting) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    isExiting = true;
    // `process.exit(0)` is used to override the default behavior of Node to exit with non-zero
    // code, which may cause `nyc` to not collect coverage information.
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  };

  process.on('SIGINT', gracefullyExit);
  process.on('SIGTERM', gracefullyExit);
}
