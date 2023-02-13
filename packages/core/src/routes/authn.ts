import type { ConnectorSession } from '@logto/connector-kit';
import { ConnectorError, ConnectorErrorCodes, ConnectorType } from '@logto/connector-kit';
import { arbitraryObjectGuard } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyBearerTokenFromRequest } from '#src/middleware/koa-auth.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getConnectorSessionResultFromJti,
  assignConnectorSessionResultViaJti,
} from '#src/utils/saml-assertion-handler.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

/**
 * Authn stands for authentication.
 * This router will have a route `/authn` to authenticate tokens with a general manner.
 */
export default function authnRoutes<T extends AnonymousRouter>(
  ...[router, { envSet, provider, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { findUserRoles },
    socials: { getConnector },
  } = libraries;

  router.get(
    '/authn/hasura',
    koaGuard({
      query: z.object({ resource: z.string().min(1), unauthorizedRole: z.string().optional() }),
      status: [200, 401],
    }),
    async (ctx, next) => {
      const { resource, unauthorizedRole } = ctx.guard.query;
      const expectedRole = ctx.headers['expected-role']?.toString();

      const verifyToken = async (expectedResource?: string) => {
        try {
          return await verifyBearerTokenFromRequest(envSet, ctx.request, expectedResource);
        } catch {
          return {
            sub: undefined,
            roleNames: undefined,
          };
        }
      };

      const { sub } = await verifyToken(resource);
      const roles = sub ? await findUserRoles(sub) : [];
      const roleNames = new Set(roles.map(({ name }) => name));

      if (unauthorizedRole && (!expectedRole || !roleNames.has(expectedRole))) {
        ctx.body = {
          'X-Hasura-User-Id':
            sub ??
            // When the previous token verification throws, the reason could be resource mismatch.
            // So we verify the token again with no resource provided.
            (await verifyToken().then(({ sub }) => sub)),
          'X-Hasura-Role': unauthorizedRole,
        };
        ctx.status = 200;

        return next();
      }

      if (expectedRole) {
        assertThat(
          roleNames.has(expectedRole),
          new RequestError({ code: 'auth.expected_role_not_found', status: 401 })
        );
      }

      ctx.body = {
        'X-Hasura-User-Id': sub,
        'X-Hasura-Role': expectedRole,
      };
      ctx.status = 200;

      return next();
    }
  );

  // Create an specialized API to handle SAML assertion
  router.post(
    '/authn/saml/:connectorId',
    /**
     * The API does not care the type of the SAML assertion request body, simply pass this to
     * connector's built-in methods.
     */
    koaGuard({ body: arbitraryObjectGuard, params: z.object({ connectorId: z.string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { connectorId },
        body,
      } = ctx.guard;
      const connector = await getConnector(connectorId);
      assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

      const samlAssertionGuard = z.object({ SAMLResponse: z.string(), RelayState: z.string() });
      const samlAssertionParseResult = samlAssertionGuard.safeParse(body);

      if (!samlAssertionParseResult.success) {
        throw new ConnectorError(
          ConnectorErrorCodes.InvalidResponse,
          samlAssertionParseResult.error
        );
      }

      /**
       * Since `RelayState` will be returned with value unchanged, we use it to pass `jti`
       * to find the connector session we used to store essential information.
       */
      const { RelayState: jti } = samlAssertionParseResult.data;

      const getSession = async () => getConnectorSessionResultFromJti(jti, provider);
      const setSession = async (connectorSession: ConnectorSession) =>
        assignConnectorSessionResultViaJti(jti, provider, connectorSession);

      const { validateSamlAssertion } = connector;
      assertThat(
        validateSamlAssertion,
        new ConnectorError(ConnectorErrorCodes.NotImplemented, {
          message: 'Method `validateSamlAssertion()` is not implemented.',
        })
      );
      const redirectTo = await validateSamlAssertion({ body }, getSession, setSession);

      ctx.redirect(redirectTo);

      return next();
    }
  );
}
