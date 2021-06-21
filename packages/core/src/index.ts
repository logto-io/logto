import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';

const router = new Router();

const app = new Koa();
const PORT = 3000;

const oidc = new Provider(`http://localhost:${PORT}/oidc`, {
  cookies: {
    // V2: Rotate this when necessary
    // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
    keys: ['LOGTOSEKRIT1'],
  },
  clients: [
    {
      client_id: 'foo',
      redirect_uris: ['http://localhost:3000/callback'],
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
    },
  ],
  findAccount: (ctx, sub) => {
    console.log('finding account');
    return {
      accountId: sub,
      claims: async (use, scope, claims) => {
        console.log('claims', use, scope, claims);
        return { sub };
      },
    };
  },
});

router.get('/callback', (ctx) => {
  ctx.body = 'A callback';
});

app.use(mount('/oidc', oidc.app)).use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
