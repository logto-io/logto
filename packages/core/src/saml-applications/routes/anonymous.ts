import { generateStandardId, generateStandardShortId } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';
import { addMinutes } from 'date-fns';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';

import {
  getSignInUrl,
  validateSamlApplicationDetails,
  loginRequestExtractGuard,
  getSamlIdpAndSp,
} from './utils.js';

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { envSet, libraries, queries }]: RouterInitArgs<T>
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
    async (ctx, next) => {
      const {
        params: { id },
        // TODO: handle `RelayState` later
        query: { Signature, ...rest },
      } = ctx.guard;

      const [{ metadata, certificate }, details] = await Promise.all([
        getSamlIdPMetadataByApplicationId(id),
        getSamlApplicationDetailsById(id),
      ]);

      const { entityId, acsUrl, redirectUri } = validateSamlApplicationDetails(details);

      const { idp, sp } = getSamlIdpAndSp({
        idp: { metadata, certificate },
        sp: { entityId, acsUrl },
      });

      const octetString = Object.keys(ctx.request.query)
        // eslint-disable-next-line no-restricted-syntax
        .map((key) => key + '=' + encodeURIComponent(ctx.request.query[key] as string))
        .join('&');
      const { SAMLRequest, SigAlg } = rest;

      // Parse login request
      try {
        const loginRequestResult = await idp.parseLoginRequest(sp, 'redirect', {
          query: removeUndefinedKeys({
            SAMLRequest,
            Signature,
            SigAlg,
          }),
          octetString,
        });

        const extractResult = loginRequestExtractGuard.safeParse(loginRequestResult.extract);

        if (!extractResult.success) {
          throw new RequestError({
            code: 'application.saml.invalid_saml_request',
            error: extractResult.error.flatten(),
          });
        }

        assertThat(
          extractResult.data.issuer === entityId,
          'application.saml.auth_request_issuer_not_match'
        );

        const state = generateStandardId(32);
        const signInUrl = await getSignInUrl({
          issuer: envSet.oidc.issuer,
          applicationId: id,
          redirectUri,
          state,
        });

        const currentDate = new Date();
        const expiresAt = addMinutes(currentDate, 10);
        const createSession = {
          id: generateStandardId(32),
          applicationId: id,
          oidcState: state,
          samlRequestId: extractResult.data.request.id,
          // Expire the session in 10 minutes.
          expiresAt: expiresAt.getTime(),
        };

        const insertSamlAppSession = await insertSession(createSession);

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
    async (ctx, next) => {
      const {
        params: { id },
        // TODO: handle `RelayState` later
        body: { SAMLRequest },
      } = ctx.guard;

      const [{ metadata, certificate }, details] = await Promise.all([
        getSamlIdPMetadataByApplicationId(id),
        getSamlApplicationDetailsById(id),
      ]);

      const { acsUrl, entityId, redirectUri } = validateSamlApplicationDetails(details);

      const { idp, sp } = getSamlIdpAndSp({
        idp: { metadata, certificate },
        sp: { entityId, acsUrl },
      });

      // Parse login request
      try {
        const loginRequestResult = await idp.parseLoginRequest(sp, 'post', {
          body: {
            SAMLRequest,
          },
        });

        const extractResult = loginRequestExtractGuard.safeParse(loginRequestResult.extract);

        if (!extractResult.success) {
          throw new RequestError({
            code: 'application.saml.invalid_saml_request',
            error: extractResult.error.flatten(),
          });
        }

        assertThat(
          extractResult.data.issuer === entityId,
          'application.saml.auth_request_issuer_not_match'
        );

        const state = generateStandardShortId();
        const signInUrl = await getSignInUrl({
          issuer: envSet.oidc.issuer,
          applicationId: id,
          redirectUri,
          state,
        });

        const insertSamlAppSession = await insertSession({
          id: generateStandardId(),
          applicationId: id,
          oidcState: state,
          samlRequestId: extractResult.data.request.id,
          // Expire the session in 10 minutes.
          expiresAt: addMinutes(new Date(), 10).getTime(),
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
