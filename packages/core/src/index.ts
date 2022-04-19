import 'module-alias/register.js';

import dotenv from 'dotenv';
import Koa from 'koa';

dotenv.config();

/* eslint-disable import/first */
import initApp from './app/init';
import { initConnectors } from './connectors';
import envSet from './env-set';
import initI18n from './i18n/init';
/* eslint-enable import/first */

(async () => {
  try {
    const app = new Koa({
      proxy: envSet.values.trustingTlsOffloadingProxies,
    });
    await initConnectors();
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
