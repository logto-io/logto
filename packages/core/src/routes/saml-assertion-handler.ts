import type { ConnectorSession } from '@logto/connector-kit';
import { ConnectorError, ConnectorErrorCodes, ConnectorType } from '@logto/connector-kit';
import { arbitraryObjectGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getConnectorSessionResultFromJti,
  assignConnectorSessionResultViaJti,
} from '#src/utils/saml-assertion-handler.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function samlAssertionHandlerRoutes<T extends AnonymousRouter>(
  ...[router, { provider, libraries }]: RouterInitArgs<T>
) {
  const {
    socials: { getConnector },
  } = libraries;

  // Create an specialized API to handle SAML assertion
  router.post(
    '/saml-assertion-handler/:connectorId',
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
