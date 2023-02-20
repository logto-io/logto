import createServer, { compose, withRequest } from '@withtyped/server';
import dotenv from 'dotenv';
import { findUp } from 'find-up';

import withHttpProxy from './middleware/with-http-proxy.js';
import withSpa from './middleware/with-spa.js';

dotenv.config({ path: await findUp('.env', {}) });

const { default: router } = await import('./routes/index.js');

const isProduction = process.env.NODE_ENV === 'production';
const ignorePathnames = ['/api'];

const { listen } = createServer({
  port: 3003,
  composer: compose(withRequest())
    .and(router.routes())
    .and(
      isProduction
        ? withSpa({ pathname: '/', root: '../console/dist', ignorePathnames })
        : withHttpProxy('/', {
            target: 'http://localhost:5002',
            changeOrigin: true,
            ignorePathnames,
          })
    ),
});

await listen((port) => {
  console.log(`Logto cloud is running at http://localhost:${port}`);
});
