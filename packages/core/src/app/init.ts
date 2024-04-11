import fs from 'node:fs/promises';
import http2 from 'node:http2';

import { appInsights } from '@logto/app-insights/node';
import { toTitle, trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import { TenantNotFoundError, tenantPool } from '#src/tenants/index.js';
import { consoleLog } from '#src/utils/console.js';
import { getTenantId } from '#src/utils/tenant.js';

const logListening = (type: 'core' | 'admin' = 'core') => {
  const urlSet = type === 'core' ? EnvSet.values.urlSet : EnvSet.values.adminUrlSet;

  for (const url of urlSet.deduplicated()) {
    consoleLog.info(chalk.bold(`${toTitle(type)} app is running at ${url.toString()}`));
  }
};

const serverTimeout = 120_000;

export default async function initApp(app: Koa): Promise<void> {
  app.use(async (ctx, next) => {
    if (EnvSet.values.isDomainBasedMultiTenancy && ['/status', '/'].includes(ctx.URL.pathname)) {
      ctx.status = 204;

      return next();
    }

    const [tenantId, isCustomDomain] = await getTenantId(ctx.URL);

    if (!tenantId) {
      ctx.status = 404;

      return next();
    }

    // If the request is a custom domain of the tenant, use the custom endpoint to build "OIDC issuer"
    // otherwise, build from the default endpoint (subdomain).
    const customEndpoint = isCustomDomain ? ctx.URL.origin : undefined;

    const tenant = await trySafe(tenantPool.get(tenantId, customEndpoint), (error) => {
      ctx.status = error instanceof TenantNotFoundError ? 404 : 500;
      void appInsights.trackException(error);
    });

    if (!tenant) {
      return next();
    }

    try {
      tenant.requestStart();
      await tenant.run(ctx, next);
      tenant.requestEnd();
    } catch (error: unknown) {
      tenant.requestEnd();
      void appInsights.trackException(error);

      throw error;
    }
  });

  const { isHttpsEnabled, httpsCert, httpsKey, urlSet, adminUrlSet } = EnvSet.values;

  if (isHttpsEnabled && httpsCert && httpsKey) {
    const createHttp2Server = async () =>
      http2.createSecureServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey), allowHTTP1: true },
        app.callback()
      );

    const coreServer = await createHttp2Server();
    coreServer.listen(urlSet.port, () => {
      logListening();
    });
    coreServer.setTimeout(serverTimeout);

    // Create another server if admin localhost enabled
    if (!adminUrlSet.isLocalhostDisabled) {
      const adminServer = await createHttp2Server();
      adminServer.listen(adminUrlSet.port, () => {
        logListening('admin');
      });
      adminServer.setTimeout(serverTimeout);
    }

    return;
  }

  // Chrome doesn't allow insecure HTTP/2 servers, stick with HTTP for localhost.
  const coreServer = app.listen(urlSet.port, () => {
    logListening();
  });
  coreServer.setTimeout(serverTimeout);

  // Create another server if admin localhost enabled
  if (!adminUrlSet.isLocalhostDisabled) {
    const adminServer = app.listen(adminUrlSet.port, () => {
      logListening('admin');
    });
    adminServer.setTimeout(serverTimeout);
  }
}
