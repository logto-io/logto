import 'module-alias/register';

import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import initApp from './init';
import { getEnv } from './utils';

const app = new Koa();
const port = Number(getEnv('PORT', '3001'));

(async () => {
  try {
    await initApp(app, port);
  } catch (error: unknown) {
    console.log('Error while initializing app', error);
  }
})();
