import Koa from 'koa';

import { configDotEnv } from './env-set/dot-env.js';
import envSet from './env-set/index.js';
import initI18n from './i18n/init.js';

await configDotEnv();
await envSet.load();
const app = new Koa({
  proxy: envSet.values.trustProxyHeader,
});
await initI18n();

// Import last until init completed
const { default: initApp } = await import('./app/init.js');
await initApp(app);
