import 'module-alias/register';

import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import initApp from './init';

const app = new Koa();

(async () => {
  try {
    await initApp(app);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
