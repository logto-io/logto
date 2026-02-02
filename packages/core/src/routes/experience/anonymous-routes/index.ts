import { webAuthnAuthenticationOptionsGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { generateWebAuthnAuthenticationOptions } from '../../interaction/utils/webauthn.js';
import { SignInExperienceValidator } from '../classes/libraries/sign-in-experience-validator.js';
import { experienceRoutes } from '../const.js';

export default function experienceAnonymousRoutes<T extends WithInteractionDetailsContext>(
  router: Router<unknown, T>,
  tenantContext: TenantContext
) {
  const { libraries, queries, provider } = tenantContext;

  router.get(
    `${experienceRoutes.prefix}/sso-connectors`,
    koaGuard({
      query: z.object({
        email: z.string().email(),
      }),
      status: [200, 400],
      response: z.object({
        connectorIds: z.string().array(),
      }),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.query;

      assertThat(
        email.split('@')[1],
        new RequestError({ code: 'guard.invalid_input', status: 400, email })
      );

      const signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
      const connectors = await signInExperienceValidator.getEnabledSsoConnectorsByEmail(email);

      ctx.body = {
        connectorIds: connectors.map(({ id }) => id),
      };

      return next();
    }
  );

  if (EnvSet.values.isDevFeaturesEnabled) {
    router.post(
      `${experienceRoutes.prefix}/preflight/sign-in-web-authn/authentication`,
      koaGuard({
        response: z.object({
          authenticationOptions: webAuthnAuthenticationOptionsGuard,
        }),
        status: [200, 400, 404],
      }),
      async (ctx, next) => {
        const { hostname } = ctx.URL;
        const authenticationOptions = await generateWebAuthnAuthenticationOptions({
          mfaVerifications: [],
          rpId: hostname,
          // Generate discoverable credential options on initiating passkey sign-in. The user
          // will be resolved later by credentialId/rpId on verification.
          allowDiscoverable: true,
        });

        const details = await provider.interactionDetails(ctx.req, ctx.res);
        await provider.interactionResult(ctx.req, ctx.res, {
          ...details.result,
          signInWebAuthn: { authenticationOptions },
        });

        ctx.body = {
          authenticationOptions,
        };

        ctx.status = 200;

        return next();
      }
    );
  }
}
