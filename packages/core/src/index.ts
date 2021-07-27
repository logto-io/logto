/* eslint-disable import/first */
import 'module-alias/register.js';

import dotenv from 'dotenv';

dotenv.config();

import Koa from 'koa';
import initI18n from './init/i18n';
import initApp from './init/app';

const app = new Koa();

(async () => {
  try {
    await initI18n();
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
