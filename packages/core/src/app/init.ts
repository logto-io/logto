import fs from 'fs/promises';
import http2 from 'http2';

import { deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import { defaultTenant, tenantPool } from '#src/tenants/index.js';

const logListening = () => {
  const { localhostUrl, endpoint } = EnvSet.values;

  for (const url of deduplicate([localhostUrl, endpoint.toString()])) {
    console.log(chalk.bold(chalk.green(`App is running at ${url}`)));
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

  const { isHttpsEnabled, httpsCert, httpsKey, port } = EnvSet.values;

  if (isHttpsEnabled && httpsCert && httpsKey) {
    http2
      .createSecureServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey) },
        app.callback()
      )
      .listen(port, () => {
        logListening();
      });

    return;
  }

  // Chrome doesn't allow insecure http/2 servers
  app.listen(port, () => {
    logListening();
  });
}
