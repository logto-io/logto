import Koa from 'koa';

import initApp from './app/init.js';
import { initConnectors } from './connectors/index.js';
import { configDotEnv } from './env-set/dot-env.js';
import envSet from './env-set/index.js';
import initI18n from './i18n/init.js';

// Update after we migrate to ESM
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  try {
    await configDotEnv();
    await envSet.load();
    const app = new Koa({
      proxy: envSet.values.trustProxyHeader,
    });
    await initConnectors();
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
    await envSet.poolSafe?.end();
  }
})();
