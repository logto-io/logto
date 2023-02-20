import { cloudApiIndicator } from '@logto/schemas';
import type { RequestContext } from '@withtyped/server';
import createServer, { compose, withRequest } from '@withtyped/server';
import dotenv from 'dotenv';
import { findUp } from 'find-up';

import withAuth from './middleware/with-auth.js';
import withHttpProxy from './middleware/with-http-proxy.js';
import withPathname from './middleware/with-pathname.js';
import withSpa from './middleware/with-spa.js';

dotenv.config({ path: await findUp('.env', {}) });

const { EnvSet } = await import('./env-set/index.js');
const { default: router } = await import('./routes/index.js');

const ignorePathnames = ['/api'];

const { listen } = createServer({
  port: 3003,
  composer: compose(withRequest())
    .and(
      withPathname(
        '/api',
        compose<RequestContext>()
          .and(withAuth({ endpoint: EnvSet.global.logtoEndpoint, audience: cloudApiIndicator }))
          .and(router.routes())
      )
    )
    .and(
      EnvSet.isProduction
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
