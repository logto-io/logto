/* eslint-disable max-lines */
// TODO: refactor this file to reduce LOC
import { authRequestInfoGuard, SamlApplicationSessions } from '@logto/schemas';
import { generateStandardId, generateStandardShortId } from '@logto/shared';
import { cond, removeUndefinedKeys, trySafe } from '@silverhand/essentials';
import { addMinutes } from 'date-fns';
import { z } from 'zod';

import { spInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';
import { SamlApplication } from '#src/saml-application/SamlApplication/index.js';
import { generateAutoSubmitForm } from '#src/saml-application/SamlApplication/utils.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { verifyAndGetSamlSessionData } from './utils.js';

const samlApplicationSignInCallbackQueryParametersGuard = z
  .object({
    code: z.string(),
    state: z.string(),
    redirectUri: z.string(),
    error: z.string(),
    error_description: z.string(),
  })
  .partial();

const { rawAuthRequest: samlRequestGuard, relayState: relayStateGuard } =
  SamlApplicationSessions.createGuard.shape;

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { queries, envSet }]: RouterInitArgs<T>
) {
  const {
    samlApplications: { getSamlApplicationDetailsById },
    samlApplicationSessions: { insertSession, removeSessionOidcStateById, deleteExpiredSessions },
  } = queries;

  router.get(
    '/saml-applications/:id/metadata',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [200, 400, 404],
      response: z.string(),
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet);

      ctx.status = 200;
      ctx.body = samlApplication.idPMetadata;
      ctx.type = 'text/xml;charset=utf-8';

      return next();
    }
  );

  router.get(
    '/saml-applications/:id/callback',
    koaGuard({
      params: z.object({ id: z.string() }),
      query: samlApplicationSignInCallbackQueryParametersGuard,
      status: [200, 400, 404],
    }),
    koaAuditLog(queries),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const consoleLog = getConsoleLogFromContext(ctx);
      const {
        params: { id },
        query,
      } = ctx.guard;

      /**
       * When generating swagger.json, we build path/query guards and verify whether the query/path guard is an instance of ZodObject. Previously, our query guard was a Union of Zod Objects, which failed the validation. Now, we directly use ZodObject guards and perform additional validations within the API.
       */
      /* === query guard === */
      // Validate query parameters
      if (!query.code && !query.error) {
        throw new RequestError({
          code: 'guard.invalid_input',
          message: 'Either code or error must be present',
          type: 'query',
        });
      }

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (query.code && (query.error || query.error_description)) {
        throw new RequestError({
          code: 'guard.invalid_input',
          type: 'query',
          message: 'Cannot have both code and error fields',
        });
      }

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (query.error && (query.code || query.state || query.redirectUri)) {
        throw new RequestError({
          code: 'guard.invalid_input',
          type: 'query',
          message: 'When error is present, only error_description is allowed',
        });
      }

      // Handle error in query parameters
      if (query.error) {
        throw new RequestError({
          code: 'oidc.invalid_request',
          message: query.error_description,
          type: 'query',
        });
      }

      assertThat(
        query.code,
        new RequestError({
          code: 'guard.invalid_input',
          type: 'query',
          message: '`code` is required.',
        })
      );
      /* === End query guard === */

      const log = ctx.createLog('SamlApplication.Callback');

      log.append({
        query,
        applicationId: id,
      });

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet);

      assertThat(
        samlApplication.config.redirectUri === samlApplication.samlAppCallbackUrl,
        'oidc.invalid_redirect_uri'
      );

      const { code, state, redirectUri } = query;

      if (redirectUri) {
        assertThat(redirectUri === samlApplication.samlAppCallbackUrl, 'oidc.invalid_redirect_uri');
      }

      const { relayState, samlRequestId, sessionId, sessionExpiresAt } =
        await verifyAndGetSamlSessionData(ctx, queries.samlApplicationSessions, state);
      log.append({
        session: {
          relayState,
          samlRequestId,
          sessionId,
          sessionExpiresAt,
        },
      });

      // Handle OIDC callback and get user info
      const userInfo = await samlApplication.handleOidcCallbackAndGetUserInfo({
        code,
      });
      log.append({
        userInfo,
      });

      const {
        context,
        entityEndpoint,
        relayState: returnedRelayState,
      } = await samlApplication.createSamlResponse({
        userInfo,
        relayState,
        samlRequestId,
        sessionId,
        sessionExpiresAt,
      });

      log.append({
        context,
        entityEndpoint,
        returnedRelayState,
      });

      // Return auto-submit form
      ctx.body = generateAutoSubmitForm(entityEndpoint, context, returnedRelayState);

      // Reset cookies and state only after the whole process is done.
      if (state) {
        const sessionId = ctx.cookies.get(spInitiatedSamlSsoSessionCookieName);
        if (sessionId) {
          // Mark OIDC `state` as verified.
          await trySafe(
            async () => removeSessionOidcStateById(sessionId),
            (error) => {
              consoleLog.warn(
                'error encountered while resetting OIDC `state`',
                JSON.stringify(error)
              );
            }
          );
          // Clear the session cookie
          ctx.cookies.set(spInitiatedSamlSsoSessionCookieName, '', {
            httpOnly: true,
            expires: new Date(0),
          });
        }
        await trySafe(
          async () => deleteExpiredSessions(),
          (error) => {
            consoleLog.warn(
              'error encountered while deleting expired sessions',
              JSON.stringify(error)
            );
          }
        );
      }

      return next();
    }
  );

  // Redirect binding SAML authentication request endpoint
  router.get(
    '/saml/:id/authn',
    koaGuard({
      params: z.object({ id: z.string() }),
      query: z
        .object({
          SAMLRequest: samlRequestGuard,
          Signature: z.string().optional(),
          SigAlg: z.string().optional(),
          RelayState: relayStateGuard,
        })
        .catchall(z.string()),
      status: [200, 302, 400, 404],
    }),
    koaAuditLog(queries),
    async (ctx, next) => {
      const {
        params: { id },
        query: { Signature, RelayState, ...rest },
      } = ctx.guard;

      const log = ctx.createLog('SamlApplication.AuthnRequest');
      log.append({
        query: ctx.guard.query,
        applicationId: id,
      });

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet);

      const octetString = Object.keys(ctx.request.query)
        // eslint-disable-next-line no-restricted-syntax
        .map((key) => key + '=' + encodeURIComponent(ctx.request.query[key] as string))
        .join('&');
      const { SAMLRequest, SigAlg } = rest;

      // Parse login request
      const loginRequestResult = await samlApplication.parseLoginRequest('redirect', {
        query: removeUndefinedKeys({
          SAMLRequest,
          Signature,
          SigAlg,
        }),
        octetString,
      });

      log.append({ loginRequestResult });
      const extractResult = authRequestInfoGuard.safeParse(loginRequestResult.extract);
      log.append({ extractResult });

      if (!extractResult.success) {
        throw new RequestError({
          code: 'application.saml.invalid_saml_request',
          error: extractResult.error.flatten(),
        });
      }

      log.append({ extractResultData: extractResult.data });

      assertThat(
        extractResult.data.issuer === samlApplication.config.spEntityId,
        'application.saml.auth_request_issuer_not_match'
      );

      const state = generateStandardId(32);
      const signInUrl = await samlApplication.getSignInUrl({
        state,
      });
      log.append({ signInUrl: signInUrl.toString() });

      const currentDate = new Date();
      const expiresAt = addMinutes(currentDate, 60); // Lifetime of the session is 60 minutes.
      const createSession = {
        id: generateStandardId(32),
        applicationId: id,
        oidcState: state,
        samlRequestId: extractResult.data.request.id,
        rawAuthRequest: SAMLRequest,
        // Expire the session in 60 minutes.
        expiresAt: expiresAt.getTime(),
        ...cond(RelayState && { relayState: RelayState }),
      };
      log.append({ createSession });

      const insertSamlAppSession = await insertSession(createSession);
      log.append({ insertSamlAppSession });

      // Set the session ID to cookie for later use.
      ctx.cookies.set(spInitiatedSamlSsoSessionCookieName, insertSamlAppSession.id, {
        httpOnly: true,
        sameSite: 'strict',
        expires: expiresAt,
        overwrite: true,
      });

      log.append({
        cookie: {
          spInitiatedSamlSsoSessionCookieName: insertSamlAppSession.id,
        },
      });

      ctx.redirect(signInUrl.toString());

      return next();
    }
  );

  // Post binding SAML authentication request endpoint
  router.post(
    '/saml/:id/authn',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: z.object({
        SAMLRequest: samlRequestGuard,
        RelayState: relayStateGuard,
      }),
      status: [200, 302, 400, 404],
    }),
    koaAuditLog(queries),
    async (ctx, next) => {
      const {
        params: { id },
        body: { SAMLRequest, RelayState },
      } = ctx.guard;

      const log = ctx.createLog('SamlApplication.AuthnRequest');
      log.append({
        body: ctx.guard.body,
        applicationId: id,
      });

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet);

      // Parse login request
      const loginRequestResult = await samlApplication.parseLoginRequest('post', {
        body: {
          SAMLRequest,
        },
      });

      log.append({ loginRequestResult });
      const extractResult = authRequestInfoGuard.safeParse(loginRequestResult.extract);
      log.append({ extractResult });

      if (!extractResult.success) {
        throw new RequestError({
          code: 'application.saml.invalid_saml_request',
          error: extractResult.error.flatten(),
        });
      }
      log.append({ extractResultData: extractResult.data });

      assertThat(
        extractResult.data.issuer === samlApplication.config.spEntityId,
        'application.saml.auth_request_issuer_not_match'
      );

      const state = generateStandardShortId();
      const signInUrl = await samlApplication.getSignInUrl({
        state,
      });
      log.append({ signInUrl: signInUrl.toString() });

      const currentDate = new Date();
      const expiresAt = addMinutes(currentDate, 60); // Lifetime of the session is 60 minutes.

      const createSession = {
        id: generateStandardId(),
        applicationId: id,
        oidcState: state,
        samlRequestId: extractResult.data.request.id,
        rawAuthRequest: SAMLRequest,
        // Expire the session in 60 minutes.
        expiresAt: expiresAt.getTime(),
        ...cond(RelayState && { relayState: RelayState }),
      };
      log.append({ createSession });

      const insertSamlAppSession = await insertSession(createSession);
      log.append({ insertSamlAppSession });

      // Set the session ID to cookie for later use.
      ctx.cookies.set(spInitiatedSamlSsoSessionCookieName, insertSamlAppSession.id, {
        httpOnly: true,
        sameSite: 'strict',
        expires: expiresAt,
        overwrite: true,
      });

      log.append({
        cookie: {
          spInitiatedSamlSsoSessionCookieName: insertSamlAppSession.id,
        },
      });

      ctx.redirect(signInUrl.toString());

      return next();
    }
  );
}
/* eslint-enable max-lines */
