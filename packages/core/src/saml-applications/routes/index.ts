import {
  ApplicationType,
  samlApplicationCreateGuard,
  samlApplicationResponseGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';
import { generateInternalSecret } from '#src/routes/applications/application-secret.js';
import type { ManagementApiRouter, RouterInitArgs } from '#src/routes/types.js';
import { ensembleSamlApplication, validateAcsUrl } from '#src/saml-applications/routes/utils.js';
import assertThat from '#src/utils/assert-that.js';

export default function samlApplicationRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    applications: { insertApplication, findApplicationById, deleteApplicationById },
    samlApplicationConfigs: { insertSamlApplicationConfig },
  } = queries;
  const {
    samlApplicationSecrets: { createSamlApplicationSecret },
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

      if (config?.acsUrl) {
        validateAcsUrl(config.acsUrl);
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

      try {
        const [samlConfig, _] = await Promise.all([
          insertSamlApplicationConfig({
            applicationId: application.id,
            ...config,
          }),
          createSamlApplicationSecret(application.id),
        ]);

        ctx.status = 201;
        ctx.body = ensembleSamlApplication({ application, samlConfig });
      } catch (error) {
        await deleteApplicationById(application.id);
        throw error;
      }

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

      const { type } = await findApplicationById(id);
      assertThat(type === ApplicationType.SAML, 'application.saml.saml_application_only');

      await deleteApplicationById(id);

      ctx.status = 204;

      return next();
    }
  );
}
