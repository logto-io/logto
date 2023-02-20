import { cloudApiIndicator } from '@logto/schemas';
import type { RequestContext } from '@withtyped/server';
import createServer, { compose, withRequest } from '@withtyped/server';
import dotenv from 'dotenv';
import { findUp } from 'find-up';

dotenv.config({ path: await findUp('.env', {}) });

const { default: withAuth } = await import('./middleware/with-auth.js');
const { default: withHttpProxy } = await import('./middleware/with-http-proxy.js');
const { default: withPathname } = await import('./middleware/with-pathname.js');
const { default: withSpa } = await import('./middleware/with-spa.js');

const { EnvSet } = await import('./env-set/index.js');
const { default: router } = await import('./routes/index.js');
const { default: anonymousRouter } = await import('./routes-anonymous/index.js');

const ignorePathnames = ['/api'];

const { listen } = createServer({
  port: 3003,
  composer: compose(withRequest())
    .and(anonymousRouter.routes())
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
