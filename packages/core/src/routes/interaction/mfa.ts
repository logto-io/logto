import { InteractionEvent, bindMfaPayloadGuard, verifyMfaPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import { getInteractionStorage, storeInteractionResult } from './utils/interaction.js';
import { verifyMfaSettings } from './utils/sign-in-experience-validation.js';
import { verifyIdentifier } from './verifications/index.js';
import {
  bindMfaPayloadVerification,
  verifyMfaPayloadVerification,
} from './verifications/mfa-payload-verification.js';

export default function mfaRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithLogContext<T>>>,
  tenant: TenantContext
) {
  const { provider, queries } = tenant;

  // Update New MFA
  router.put(
    `${interactionPrefix}/bind-mfa`,
    koaGuard({
      body: bindMfaPayloadGuard,
      status: [204, 400, 401, 404, 422],
    }),
    koaInteractionSie(queries),
    async (ctx, next) => {
      const bindMfaPayload = ctx.guard.body;
      const {
        signInExperience,
        interactionDetails,
        createLog,
        request: {
          headers: { 'user-agent': userAgent = '' },
        },
      } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);

      const log = createLog(`Interaction.${interactionStorage.event}.BindMfa.Totp.Submit`);

      if (interactionStorage.event !== InteractionEvent.ForgotPassword) {
        verifyMfaSettings(bindMfaPayload.type, signInExperience);
      }

      const { hostname, origin } = EnvSet.values.endpoint;
      const bindMfa = await bindMfaPayloadVerification(ctx, bindMfaPayload, interactionStorage, {
        rpId: hostname,
        userAgent,
        origin,
      });

      log.append({ bindMfa, interactionStorage });

      await storeInteractionResult({ bindMfa }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );

  // Update MFA
  router.put(
    `${interactionPrefix}/mfa`,
    koaGuard({
      body: verifyMfaPayloadGuard,
      status: [204, 400, 422],
    }),
    koaInteractionSie(queries),
    async (ctx, next) => {
      const verifyMfaPayloadGuard = ctx.guard.body;
      const { interactionDetails, createLog } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);

      assertThat(
        interactionStorage.event === InteractionEvent.SignIn,
        new RequestError({
          code: 'session.mfa.mfa_sign_in_only',
        })
      );
      createLog(`Interaction.${interactionStorage.event}.Mfa.Totp.Submit`);

      const { accountId } = await verifyIdentifier(ctx, tenant, interactionStorage);
      assertThat(
        accountId,
        new RequestError({
          code: 'session.mfa.mfa_sign_in_only',
        })
      );

      const { hostname, origin } = EnvSet.values.endpoint;
      const verifiedMfa = await verifyMfaPayloadVerification(
        tenant,
        verifyMfaPayloadGuard,
        interactionStorage,
        { accountId, rpId: hostname, origin }
      );

      await storeInteractionResult({ verifiedMfa }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );
}
