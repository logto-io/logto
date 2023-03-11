import fs from 'fs/promises';
import http2 from 'http2';

import { toTitle } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import { TenantNotFoundError, tenantPool } from '#src/tenants/index.js';
import { getTenantId } from '#src/utils/tenant.js';

const logListening = (type: 'core' | 'admin' = 'core') => {
  const urlSet = type === 'core' ? EnvSet.values.urlSet : EnvSet.values.adminUrlSet;

  for (const url of urlSet.deduplicated()) {
    console.log(chalk.bold(chalk.green(`${toTitle(type)} app is running at ${url.toString()}`)));
  }
};

export default async function initApp(app: Koa): Promise<void> {
  app.use(async (ctx, next) => {
    if (EnvSet.values.isDomainBasedMultiTenancy && ctx.URL.pathname === '/status') {
      ctx.status = 204;

      return next();
    }

    const tenantId = getTenantId(ctx.URL);

    if (!tenantId) {
      ctx.status = 404;

      return next();
    }

    try {
      const tenant = await tenantPool.get(tenantId);
      await tenant.run(ctx, next);

      return;
    } catch (error: unknown) {
      if (error instanceof TenantNotFoundError) {
        ctx.status = 404;

        return next();
      }

      throw error;
    }
  });

  const { isHttpsEnabled, httpsCert, httpsKey, urlSet, adminUrlSet } = EnvSet.values;

  if (isHttpsEnabled && httpsCert && httpsKey) {
    const createHttp2Server = async () =>
      http2.createSecureServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey) },
        app.callback()
      );

    const coreServer = await createHttp2Server();
    coreServer.listen(urlSet.port, () => {
      logListening();
    });

    // Create another server if admin localhost enabled
    if (!adminUrlSet.isLocalhostDisabled) {
      const adminServer = await createHttp2Server();
      adminServer.listen(adminUrlSet.port, () => {
        logListening('admin');
      });
    }

    return;
  }

  // Chrome doesn't allow insecure HTTP/2 servers, stick with HTTP for localhost.
  app.listen(urlSet.port, () => {
    logListening();
  });

  // Create another server if admin localhost enabled
  if (!adminUrlSet.isLocalhostDisabled) {
    app.listen(adminUrlSet.port, () => {
      logListening('admin');
    });
  }
}
