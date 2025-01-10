import { authRequestInfoGuard } from '@logto/schemas';
import { generateStandardId, generateStandardShortId } from '@logto/shared';
import { cond, removeUndefinedKeys } from '@silverhand/essentials';
import { addMinutes } from 'date-fns';
import { z } from 'zod';

import { spInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';

import { SamlApplication } from '../SamlApplication/index.js';
import { generateAutoSubmitForm } from '../SamlApplication/utils.js';

const samlApplicationSignInCallbackQueryParametersGuard = z.union([
  z.object({
    code: z.string(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
  }),
]);

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { id: tenantId, libraries, queries, envSet }]: RouterInitArgs<T>
) {
  const {
    samlApplications: { getSamlIdPMetadataByApplicationId },
  } = libraries;
  const {
    samlApplications: { getSamlApplicationDetailsById },
    samlApplicationSessions: { insertSession },
  } = queries;

  router.get(
    '/saml-applications/:id/metadata',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [200, 404],
      response: z.string(),
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const { metadata } = await getSamlIdPMetadataByApplicationId(id);

      ctx.status = 200;
      ctx.body = metadata;
      ctx.type = 'text/xml;charset=utf-8';

      return next();
    }
  );

  router.get(
    '/saml-applications/:id/callback',
    koaGuard({
      params: z.object({ id: z.string() }),
      // TODO: should be able to handle `state` and `redirectUri`
      query: samlApplicationSignInCallbackQueryParametersGuard,
      status: [200, 400],
    }),
    koaAuditLog(queries),
    async (ctx, next) => {
      const {
        params: { id },
        query,
      } = ctx.guard;

      const log = ctx.createLog('SamlApplication.Callback');

      log.append({
        query,
        samlApplicationId: id,
      });

      // Handle error in query parameters
      if ('error' in query) {
        throw new RequestError({
          code: 'oidc.invalid_request',
          message: query.error_description,
        });
      }

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet.oidc.issuer, tenantId);

      assertThat(
        samlApplication.details.redirectUri === samlApplication.samlAppCallbackUrl,
        'oidc.invalid_redirect_uri'
      );

      // TODO: should be able to handle `state` and code verifier etc.
      const { code } = query;

      // Handle OIDC callback and get user info
      const userInfo = await samlApplication.handleOidcCallbackAndGetUserInfo({
        code,
      });

      const { context, entityEndpoint } = await samlApplication.createSamlResponse(userInfo);

      log.append({
        context,
        entityEndpoint,
      });

      // Return auto-submit form
      ctx.body = generateAutoSubmitForm(entityEndpoint, context);
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
          SAMLRequest: z.string().min(1),
          Signature: z.string().optional(),
          SigAlg: z.string().optional(),
          RelayState: z.string().optional(),
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
        samlApplicationId: id,
      });

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet.oidc.issuer, tenantId);

      const octetString = Object.keys(ctx.request.query)
        // eslint-disable-next-line no-restricted-syntax
        .map((key) => key + '=' + encodeURIComponent(ctx.request.query[key] as string))
        .join('&');
      const { SAMLRequest, SigAlg } = rest;

      // Parse login request
      try {
        const loginRequestResult = await samlApplication.parseLoginRequest('redirect', {
          query: removeUndefinedKeys({
            SAMLRequest,
            Signature,
            SigAlg,
          }),
          octetString,
        });

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
          extractResult.data.issuer === samlApplication.details.entityId,
          'application.saml.auth_request_issuer_not_match'
        );

        const state = generateStandardId(32);
        const signInUrl = await samlApplication.getSignInUrl({
          state,
        });

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

        const insertSamlAppSession = await insertSession(createSession);
        // Set the session ID to cookie for later use.
        ctx.cookies.set(spInitiatedSamlSsoSessionCookieName, insertSamlAppSession.id, {
          httpOnly: true,
          sameSite: 'strict',
          expires: expiresAt,
          overwrite: true,
        });

        log.append({
          cookie: {
            spInitiatedSamlSsoSessionCookieName: insertSamlAppSession,
          },
        });

        ctx.redirect(signInUrl.toString());
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          throw error;
        }

        throw new RequestError({
          code: 'application.saml.invalid_saml_request',
        });
      }

      return next();
    }
  );

  // Post binding SAML authentication request endpoint
  router.post(
    '/saml/:id/authn',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: z.object({
        SAMLRequest: z.string().min(1),
        RelayState: z.string().optional(),
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
        samlApplicationId: id,
      });

      const details = await getSamlApplicationDetailsById(id);
      const samlApplication = new SamlApplication(details, id, envSet.oidc.issuer, tenantId);

      // Parse login request
      try {
        const loginRequestResult = await samlApplication.parseLoginRequest('post', {
          body: {
            SAMLRequest,
          },
        });

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
          extractResult.data.issuer === samlApplication.details.entityId,
          'application.saml.auth_request_issuer_not_match'
        );

        const state = generateStandardShortId();
        const signInUrl = await samlApplication.getSignInUrl({
          state,
        });

        const currentDate = new Date();
        const expiresAt = addMinutes(currentDate, 60); // Lifetime of the session is 60 minutes.
        const insertSamlAppSession = await insertSession({
          id: generateStandardId(),
          applicationId: id,
          oidcState: state,
          samlRequestId: extractResult.data.request.id,
          rawAuthRequest: SAMLRequest,
          // Expire the session in 60 minutes.
          expiresAt: expiresAt.getTime(),
          ...cond(RelayState && { relayState: RelayState }),
        });
        // Set the session ID to cookie for later use.
        ctx.cookies.set(spInitiatedSamlSsoSessionCookieName, insertSamlAppSession.id, {
          httpOnly: true,
          sameSite: 'strict',
          expires: expiresAt,
          overwrite: true,
        });

        log.append({
          cookie: {
            spInitiatedSamlSsoSessionCookieName: insertSamlAppSession,
          },
        });

        ctx.redirect(signInUrl.toString());
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          throw error;
        }

        throw new RequestError({
          code: 'application.saml.invalid_saml_request',
        });
      }

      return next();
    }
  );
}
