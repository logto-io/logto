import { parseJson } from '@logto/connector-kit';
import { BindingType } from '@logto/schemas';
import camelcaseKeys from 'camelcase-keys';
import { got } from 'got';
import saml from 'samlify';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';
import { fetchOidcConfig, getUserInfo } from '#src/sso/OidcConnector/utils.js';
import { oidcTokenResponseGuard } from '#src/sso/types/oidc.js';

import assertThat from '../../utils/assert-that.js';

import { createSamlTemplateCallback, samlLogInResponseTemplate } from './utils.js';

const samlApplicationSignInCallbackQueryParametersGuard = z.union([
  z.object({
    code: z.string(),
    iss: z.string(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
  }),
]);

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { libraries, queries }]: RouterInitArgs<T>
) {
  const {
    samlApplications: { getSamlIdPMetadataByApplicationId },
  } = libraries;

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
      status: [200],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const queryParameters = ctx.request.query;

      // Find the SAML application secret by application ID
      const { applications, samlApplicationSecrets, samlApplicationConfigs } = queries;
      const {
        secret,
        oidcClientMetadata: { redirectUris },
      } = await applications.findApplicationById(id);

      // Sign-in callback handler
      const query = samlApplicationSignInCallbackQueryParametersGuard.safeParse(queryParameters);

      if (!query.success) {
        throw new RequestError('guard.invalid_input');
      }

      if ('error' in query.data) {
        throw new RequestError({
          code: 'oidc.invalid_request',
          status: 400,
          message: query.data.error_description,
        });
      }

      // TODO: need to validate state for SP initiated SAML flow
      const { code, iss } = query.data;

      const { tokenEndpoint, userinfoEndpoint } = await fetchOidcConfig(iss);

      const headers = {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const tokenRequestParameters = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: id,
        redirect_uri: redirectUris[0] ?? '',
      });

      // TODO: error handling
      // Exchange the authorization code for an access token
      const httpResponse = await got.post(tokenEndpoint, {
        body: tokenRequestParameters.toString(),
        headers,
      });

      const result = oidcTokenResponseGuard.safeParse(parseJson(httpResponse.body));

      if (!result.success) {
        throw new RequestError({
          code: 'oidc.invalid_token',
          status: 400,
          message: 'Invalid token response',
        });
      }

      const { accessToken } = camelcaseKeys(result.data);

      assertThat(accessToken, new RequestError('oidc.access_denied'));

      const userInfo = await getUserInfo(accessToken, userinfoEndpoint);

      const { metadata } = await getSamlIdPMetadataByApplicationId(id);
      const { privateKey } =
        await samlApplicationSecrets.findActiveSamlApplicationSecretByApplicationId(id);
      const { entityId, acsUrl } =
        await samlApplicationConfigs.findSamlApplicationConfigByApplicationId(id);

      assertThat(entityId && acsUrl, 'application.saml.entity_id_required');

      // eslint-disable-next-line new-cap
      const idp = saml.IdentityProvider({
        metadata,
        privateKey,
        isAssertionEncrypted: false,
        loginResponseTemplate: {
          context: samlLogInResponseTemplate,
          attributes: [
            {
              name: 'email',
              valueTag: 'email',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
              valueXsiType: 'xs:string',
            },
            {
              name: 'name',
              valueTag: 'name',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
              valueXsiType: 'xs:string',
            },
          ],
        },
      });

      const binding = acsUrl.binding ?? BindingType.Post;

      // eslint-disable-next-line new-cap
      const sp = saml.ServiceProvider({
        entityID: entityId,
        assertionConsumerService: [
          {
            Binding: binding,
            Location: acsUrl.url,
          },
        ],
      });

      // TODO: fix binding method
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { context, entityEndpoint } = await idp.createLoginResponse(
        sp,
        // @ts-expect-error --fix request object later
        null,
        'post',
        userInfo,
        createSamlTemplateCallback(idp, sp, userInfo)
      );

      ctx.body = `
        <html>
          <body>
            <form id="redirectForm" action="${entityEndpoint}" method="POST">
              <input type="hidden" name="SAMLResponse" value="${context}" />
              <input type="submit" value="Submit" /> 
            </form>
            <script>
              document.getElementById('redirectForm').submit();
            </script>
          </body>
        </html>
      `;

      return next();
    }
  );
}
