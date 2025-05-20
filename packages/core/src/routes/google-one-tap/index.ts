import { GoogleConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import koaGuard from '../../middleware/koa-guard.js';
import type { AnonymousRouter } from '../types.js';

export default function googleOneTapRoutes<T extends AnonymousRouter>(
  router: T,
  tenant: TenantContext
) {
  const {
    connectors: { getLogtoConnectors },
  } = tenant;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.get(
    '/google-one-tap/config',
    koaGuard({
      status: [200, 204, 400, 403, 404],
      response: GoogleConnector.configGuard
        .pick({
          clientId: true,
          oneTap: true,
        })
        .optional(),
    }),
    async (ctx, next) => {
      // Check CORS origin
      const origin = ctx.get('origin');
      const { isProduction } = EnvSet.values;

      // Allow any port of localhost for local development
      if (origin.includes('localhost')) {
        ctx.set('Access-Control-Allow-Origin', origin);
      }
      // In production, only allow *.logto.io or *.logto.dev domains to access
      else if (isProduction && (origin.endsWith('.logto.io') || origin.endsWith('.logto.dev'))) {
        ctx.set('Access-Control-Allow-Origin', origin);
      } else {
        throw new RequestError({ code: 'auth.forbidden', status: 403 });
      }

      ctx.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type');

      if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
        return next();
      }

      const connectors = await getLogtoConnectors();
      const googleOneTapConnector = connectors.find(
        (connector) =>
          connector.type === ConnectorType.Social &&
          connector.metadata.id === GoogleConnector.factoryId
      );

      if (!googleOneTapConnector) {
        throw new RequestError({ code: 'connector.not_found', status: 404 });
      }

      const result = GoogleConnector.configGuard.safeParse(googleOneTapConnector.dbEntry.config);

      // This should not happen since we have already validated the config when creating and updating the connector.
      if (!result.success) {
        throw new RequestError({
          code: 'connector.invalid_config',
          status: 400,
          details: result.error.flatten(),
        });
      }

      const { clientId, oneTap } = result.data;

      ctx.status = 200;
      ctx.body = { clientId, oneTap };
      return next();
    }
  );
}
