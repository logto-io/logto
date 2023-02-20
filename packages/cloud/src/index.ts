import createServer, { compose, withRequest } from '@withtyped/server';

import withHttpProxy from './middleware/with-http-proxy.js';
import withSpa from './middleware/with-spa.js';

const isProduction = process.env.NODE_ENV === 'production';

const { listen } = createServer({
  port: 3003,
  composer: compose(withRequest()).and(
    isProduction
      ? withSpa({ pathname: '/console', root: '../console/dist' })
      : withHttpProxy('/console', { target: 'http://localhost:5002', changeOrigin: true })
  ),
});

await listen((port) => {
  console.log(`Logto cloud is running at http://localhost:${port}`);
});
