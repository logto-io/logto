import 'module-alias/register.js';

import dotenv from 'dotenv';
import Koa from 'koa';

import initApp from './app/init';
import { trustingTlsOffloadingProxies } from './env/consts';
import initI18n from './i18n/init';

dotenv.config();

const app = new Koa({
  proxy: trustingTlsOffloadingProxies,
});

(async () => {
  try {
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
