import type { ConnectorSession } from '@logto/connector-kit';
import { ConnectorError, ConnectorErrorCodes, ConnectorType } from '@logto/connector-kit';
import { jsonObjectGuard, SsoAuthenticationQueryKey } from '@logto/schemas';
import { z } from 'zod';

import { idpInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import { verifyBearerTokenFromRequest } from '#src/middleware/koa-auth/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getConnectorSessionResultFromJti,
  assignConnectorSessionResultViaJti,
  getSingleSignOnSessionResultByJti,
  assignSamlAssertionResultViaJti,
} from '#src/utils/saml-assertion-handler.js';

import { ssoPath } from './interaction/const.js';
import type { AnonymousRouter, RouterInitArgs } from './types.js';

/**
 * Authn stands for authentication.
 * This router will have a route `/authn` to authenticate tokens with a general manner.
 */
export default function authnRoutes<T extends AnonymousRouter>(
  ...[router, { envSet, provider, libraries, id: tenantId, queries }]: RouterInitArgs<T>
) {
  const {
    users: { findUserRoles },
    socials: { getConnector },
    ssoConnectors: ssoConnectorsLibrary,
  } = libraries;

  const hasuraResponseGuard = z.object({
    'X-Hasura-User-Id': z.string().optional(),
    'X-Hasura-Role': z.string().optional(),
  });

  type HasuraResponse = z.infer<typeof hasuraResponseGuard>;

  router.get(
    '/authn/hasura',
    koaGuard({
      query: z.object({ resource: z.string().min(1), unauthorizedRole: z.string().optional() }),
      response: hasuraResponseGuard,
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
        } satisfies HasuraResponse;
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
      } satisfies HasuraResponse;
      ctx.status = 200;

      return next();
    }
  );

  /**
   * Standard SAML social connector's assertion consumer service endpoint
   * @deprecated
   * Will be replaced by the SSO SAML assertion consumer service endpoint bellow.
   */
  router.post(
    '/authn/saml/:connectorId',
    /**
     * The API does not care the type of the SAML assertion request body, simply pass this to
     * connector's built-in methods.
     */
    koaGuard({
      body: jsonObjectGuard,
      params: z.object({ connectorId: z.string().min(1) }),
      status: [302, 404],
    }),
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

  /**
   * SAML SSO connector's assertion consumer service endpoint
   *
   * @param connectorId The connector id.
   * @property body The SAML assertion response body.
   * @property body.RelayState We use this to find the connector session.
   *  RelayState is a SAML standard parameter that will be transmitted between the identity provider and the service provider.
   * @property body.SAMLResponse The SAML assertion response.
   *
   * @returns Redirect to the redirect uri find in the connector session storage.
   *
   * @remark
   * This API is used to handle SSO SAML assertion from the identity provider.
   * Validate and parse the SAML assertion, then store the assertion data to the connector session storage.
   * Redirect to the redirect uri find in the connector session storage.
   */
  router.post(
    `/authn/${ssoPath}/saml/:connectorId`,
    koaGuard({
      body: z
        .object({ RelayState: z.string().optional(), SAMLResponse: z.string() })
        .catchall(z.unknown()),
      params: z.object({ connectorId: z.string().min(1) }),
      status: [302, 400, 404],
    }),
    koaAuditLog(queries),
    async (ctx, next) => {
      const {
        params: { connectorId },
        body,
      } = ctx.guard;

      // Will throw 404 if connector not found, or not supported
      const connectorData = await ssoConnectorsLibrary.getSsoConnectorById(connectorId);
      const { providerName } = connectorData;

      // Will throw ConnectorError if the config is invalid
      const connectorInstance = new ssoConnectorFactories[providerName].constructor(
        connectorData,
        envSet.endpoint
      );

      assertThat(connectorInstance instanceof SamlConnector, 'connector.unexpected_type');

      // Get relay state from the request body. We need to use it to find the connector session.
      // All the rest of the request body will be validated and parsed by the connector.
      const { RelayState: jti } = body;

      // IdP initiated SSO does not provide the RelayState, we need to check if the IdP initiated SSO flow is enabled.
      if (!jti && EnvSet.values.isDevFeaturesEnabled) {
        const idpInitiatedAuthConfig =
          await queries.ssoConnectors.getIdpInitiatedAuthConfigByConnectorId(connectorId);

        // IdP initiated SSO flow is not enabled for the current connector.
        assertThat(
          idpInitiatedAuthConfig,
          new RequestError({
            code: 'session.connector_validation_session_not_found',
            status: 404,
          })
        );

        const assertionContent = await connectorInstance.parseSamlAssertionContent(body);

        const { id, expiresAt } = await ssoConnectorsLibrary.createIdpInitiatedSamlSsoSession(
          connectorId,
          assertionContent
        );

        // Set the session ID to cookie for later use.
        ctx.cookies.set(idpInitiatedSamlSsoSessionCookieName, id, {
          httpOnly: true,
          sameSite: 'strict',
          expires: new Date(expiresAt),
          overwrite: true,
        });

        const { autoSendAuthorizationRequest, clientIdpInitiatedAuthCallbackUri } =
          idpInitiatedAuthConfig;

        const log = ctx.createLog('Interaction.SignIn.Verification.IdpInitiatedSso.Create');
        log.append({
          connectorId,
          ssoSessionId: id,
          assertionContent,
        });

        // Redirect to the client side callback URI if the autoSendAuthorizationRequest is disabled.
        // Client side will generate and verify the state to prevent CSRF attack.
        if (!autoSendAuthorizationRequest) {
          assertThat(
            clientIdpInitiatedAuthCallbackUri,
            new RequestError(
              'single_sign_on.idp_initiated_authentication_client_callback_uri_not_found'
            )
          );

          const url = new URL(clientIdpInitiatedAuthCallbackUri);
          url.searchParams.append(SsoAuthenticationQueryKey.SsoConnectorId, connectorId);

          ctx.redirect(url.toString());

          return;
        }

        // Generate the OIDC authorization request URL for the IdP initiated SSO flow.
        const signInUrl = await ssoConnectorsLibrary.getIdpInitiatedSamlSsoSignInUrl(
          envSet.oidc.issuer,
          idpInitiatedAuthConfig
        );

        ctx.redirect(signInUrl.toString());

        return;
      }

      // TODO: remove this assertion after the IdP initiated SSO flow is implemented
      assertThat(
        jti,
        new RequestError({
          code: 'session.connector_validation_session_not_found',
          status: 404,
        })
      );

      // Retrieve the single sign on session data using the jti
      const singleSignOnSession = await getSingleSignOnSessionResultByJti(jti, provider);
      const { redirectUri, state, connectorId: sessionConnectorId } = singleSignOnSession;

      assertThat(
        connectorId === sessionConnectorId,
        new RequestError({
          code: 'session.connector_validation_session_not_found',
          status: 404,
        })
      );

      const assertionContent = await connectorInstance.parseSamlAssertionContent(body);
      const userInfo = connectorInstance.getUserInfoFromSamlAssertion(assertionContent);

      // Store the extracted user info to the connector session storage for later use.
      await assignSamlAssertionResultViaJti(jti, provider, {
        ...singleSignOnSession,
        userInfo,
      });

      // Client side will verify the state to prevent CSRF attack.
      const url = new URL(redirectUri);
      url.searchParams.append('state', state);

      ctx.redirect(url.toString());

      return next();
    }
  );
}
