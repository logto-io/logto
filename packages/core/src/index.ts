import 'module-alias/register.js';

import dotenv from 'dotenv';
import Koa from 'koa';

dotenv.config();

/* eslint-disable import/first */
import initApp from './app/init';
import { initConnectors } from './connectors';
import { trustingTlsOffloadingProxies } from './env/consts';
import initI18n from './i18n/init';
/* eslint-enable import/first */

const app = new Koa({
  proxy: trustingTlsOffloadingProxies,
});

(async () => {
  try {
    await initConnectors();
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
