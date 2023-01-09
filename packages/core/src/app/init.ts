import fs from 'fs/promises';
import http2 from 'http2';

import { deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';

import envSet from '#src/env-set/index.js';
import { tenantPool } from '#src/tenants/index.js';

const logListening = () => {
  const { localhostUrl, endpoint } = envSet.values;

  for (const url of deduplicate([localhostUrl, endpoint])) {
    console.log(chalk.bold(chalk.green(`App is running at ${url}`)));
  }
};

const defaultTenant = 'default';

export default async function initApp(app: Koa): Promise<void> {
  app.use(async (ctx, next) => {
    // TODO: add multi-tenancy logic
    const tenant = tenantPool.get(defaultTenant);

    return tenant.run(ctx, next);
  });

  const { isHttpsEnabled, httpsCert, httpsKey, port } = envSet.values;

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
