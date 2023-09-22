import Koa from 'koa';
import Router from 'koa-router';

import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import { type AnonymousRouter } from '#src/routes/types.js';
import type TenantContext from '#src/tenants/TenantContext.js';

const createSamlRouter = ({ id, logtoConfigs }: TenantContext) => {
  const router: AnonymousRouter = new Router();

  router.get('/cert', async (ctx, next) => {
    const { publicCert } = await logtoConfigs.getSamlSigningKeyPair();

    // Convert the certificate string to a Buffer
    const certBuffer = Buffer.from(publicCert, 'utf8');

    // Set the response headers
    ctx.set('Content-Type', 'application/x-x509-ca-cert');
    ctx.response.set(
      'Content-Disposition',
      `attachment; filename="logto-saml-certificate-${id}.crt"`
    );

    // Send the certificate
    ctx.body = certBuffer;

    return next();
  });

  return router;
};

export default function initSaml(tenant: TenantContext): Koa {
  const samlApp = new Koa();

  samlApp.use(koaBodyEtag());

  const samlRouter = createSamlRouter(tenant);

  samlApp.use(samlRouter.routes()).use(samlRouter.allowedMethods());

  return samlApp;
}
