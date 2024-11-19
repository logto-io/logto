import {
  ApplicationType,
  BindingType,
  samlApplicationCreateGuard,
  samlApplicationResponseGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';
import { generateInternalSecret } from '#src/routes/applications/application-secret.js';
import type { ManagementApiRouter, RouterInitArgs } from '#src/routes/types.js';
import { ensembleSamlApplication } from '#src/saml-applications/routes/utils.js';
import assertThat from '#src/utils/assert-that.js';

export default function samlApplicationRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    applications: { insertApplication, findApplicationById, deleteApplicationById },
    samlApplicationConfigs: { insertSamlApplicationConfig },
  } = queries;
  const {
    samlApplicationSecrets: { createNewSamlApplicationSecretForApplication },
  } = libraries;

  router.post(
    '/saml-applications',
    koaGuard({
      body: samlApplicationCreateGuard,
      response: samlApplicationResponseGuard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const { name, description, customData, config } = ctx.guard.body;

      // Only HTTP-POST binding is supported for receiving SAML assertions at the moment.
      if (config?.acsUrl?.binding && config.acsUrl.binding !== BindingType.POST) {
        throw new RequestError({
          code: 'application.saml.acs_url_binding_not_supported',
          status: 422,
        });
      }

      const application = await insertApplication(
        removeUndefinedKeys({
          id: generateStandardId(),
          secret: generateInternalSecret(),
          name,
          description,
          customData,
          oidcClientMetadata: buildOidcClientMetadata(),
          isThirdParty: true,
          type: ApplicationType.SAML,
        })
      );

      const [samlConfig, samlSecret] = await Promise.all([
        insertSamlApplicationConfig({
          applicationId: application.id,
          ...config,
        }),
        createNewSamlApplicationSecretForApplication(application.id),
      ]);

      ctx.status = 201;
      ctx.body = ensembleSamlApplication({ application, samlConfig, samlSecret });

      return next();
    }
  );

  router.delete(
    '/saml-applications/:id',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const { type, isThirdParty } = await findApplicationById(id);
      assertThat(
        type === ApplicationType.SAML && isThirdParty,
        'application.saml.saml_application_only'
      );

      await deleteApplicationById(id);

      ctx.status = 204;

      return next();
    }
  );
}
