import 'module-alias/register';

import Koa from 'koa';

import initApp from './app/init';
import envSet from './env-set';
import { configDotEnv } from './env-set/dot-env';
import initI18n from './i18n/init';

// Update after we migrate to ESM
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  try {
    await configDotEnv();
    await envSet.load();
    const app = new Koa({
      proxy: envSet.values.trustProxyHeader,
    });
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
    await envSet.poolSafe?.end();
  }
})();
