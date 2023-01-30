import fs from 'fs/promises';
import http2 from 'http2';

import { toTitle } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import { defaultTenant, tenantPool } from '#src/tenants/index.js';

const logListening = (type: 'core' | 'admin' = 'core') => {
  const urlSet = type === 'core' ? EnvSet.values.urlSet : EnvSet.values.adminUrlSet;

  for (const url of urlSet.deduplicated()) {
    console.log(chalk.bold(chalk.green(`${toTitle(type)} app is running at ${url}`)));
  }
};

const getTenantId = () => {
  if (!EnvSet.values.isMultiTenancy) {
    return defaultTenant;
  }

  if (EnvSet.values.multiTenancyMode === 'domain') {
    throw new Error('Not implemented');
  }

  return !EnvSet.values.isProduction && EnvSet.values.developmentTenantId;
};

export default async function initApp(app: Koa): Promise<void> {
  app.use(async (ctx, next) => {
    const tenantId = getTenantId();

    if (!tenantId) {
      ctx.status = 404;

      return next();
    }

    const tenant = await tenantPool.get(tenantId);

    return tenant.run(ctx, next);
  });

  const { isHttpsEnabled, httpsCert, httpsKey, urlSet, adminUrlSet } = EnvSet.values;

  if (isHttpsEnabled && httpsCert && httpsKey) {
    const createHttp2Server = async () =>
      http2.createSecureServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey) },
        app.callback()
      );

    const coreServer = await createHttp2Server();
    const adminServer = await createHttp2Server();

    coreServer.listen(urlSet.port, () => {
      logListening();
    });

    adminServer.listen(adminUrlSet.port, () => {
      logListening('admin');
    });

    return;
  }

  // Chrome doesn't allow insecure http/2 servers
  app.listen(urlSet.port, () => {
    logListening();
  });

  app.listen(adminUrlSet.port, () => {
    logListening('admin');
  });
}
