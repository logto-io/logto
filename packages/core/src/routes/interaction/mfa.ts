import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  bindMfaPayloadGuard,
  verifyMfaPayloadGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from './const.js';
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

  // Set New MFA
  router.post(
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

      const log = createLog(
        `Interaction.${interactionStorage.event}.BindMfa.${bindMfaPayload.type}.Submit`
      );

      if (interactionStorage.event !== InteractionEvent.ForgotPassword) {
        verifyMfaSettings(bindMfaPayload.type, signInExperience);
      }

      const { bindMfas = [], accountId } = interactionStorage;

      if (bindMfaPayload.type === MfaFactor.BackupCode) {
        const { mfaVerifications } = accountId
          ? await queries.users.findUserById(accountId)
          : { mfaVerifications: [] };
        assertThat(
          bindMfas.some(({ type }) => type !== MfaFactor.BackupCode) ||
            mfaVerifications.some(({ type }) => type !== MfaFactor.BackupCode),
          'session.mfa.backup_code_can_not_be_alone'
        );
      } else {
        assertThat(bindMfas.length === 0, 'session.mfa.bind_mfa_existed');
      }

      const { hostname, origin } = ctx.URL;
      const bindMfa = await bindMfaPayloadVerification(ctx, bindMfaPayload, interactionStorage, {
        rpId: hostname,
        userAgent,
        origin,
      });

      log.append({ bindMfa, interactionStorage });

      await storeInteractionResult({ bindMfas: [...bindMfas, bindMfa] }, ctx, provider, true);

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
      createLog(`Interaction.${interactionStorage.event}.Mfa.${verifyMfaPayloadGuard.type}.Submit`);

      const { accountId } = await verifyIdentifier(ctx, tenant, interactionStorage);
      assertThat(
        accountId,
        new RequestError({
          code: 'session.mfa.mfa_sign_in_only',
        })
      );

      const { hostname, origin } = ctx.URL;
      const verifiedMfa = await verifyMfaPayloadVerification(
        tenant,
        verifyMfaPayloadGuard,
        interactionStorage,
        { accountId, rpId: hostname, origin }
      );

      // Update last used time
      const user = await queries.users.findUserById(accountId);
      await queries.users.updateUserById(accountId, {
        mfaVerifications: user.mfaVerifications.map((mfa) => {
          if (mfa.id !== verifiedMfa.id) {
            return mfa;
          }

          return {
            ...mfa,
            lastUsedAt: new Date().toISOString(),
          };
        }),
      });

      await storeInteractionResult({ verifiedMfa }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );

  // Update MFA skip
  router.put(
    `${interactionPrefix}/mfa-skipped`,
    koaGuard({
      body: z.object({
        // Only allow to skip MFA binding
        mfaSkipped: z.literal(true),
      }),
      status: [204, 400, 422],
    }),
    koaInteractionSie(queries),
    async (ctx, next) => {
      const {
        signInExperience: {
          mfa: { policy },
        },
      } = ctx;

      assertThat(
        policy === MfaPolicy.UserControlled,
        new RequestError({
          code: 'session.mfa.mfa_policy_not_user_controlled',
          status: 422,
        })
      );

      await storeInteractionResult({ mfaSkipped: true }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );
}
