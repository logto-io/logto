import { GoogleConnector } from '@logto/connector-kit';
import {
  googleOneTapVerificationVerifyPayloadGuard,
  VerificationType,
  ConnectorType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import { GoogleOneTapVerification } from '../classes/verifications/google-one-tap-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

/**
 * Get and validate Google One Tap connector configuration
 */
const getGoogleOneTapConnector = async (getLogtoConnectors: () => Promise<LogtoConnector[]>) => {
  const connectors = await getLogtoConnectors();
  const googleOneTapConnector = connectors.find(
    (connector) =>
      connector.type === ConnectorType.Social && connector.metadata.id === GoogleConnector.factoryId
  );

  if (!googleOneTapConnector) {
    throw new RequestError({ code: 'connector.not_found', status: 404 });
  }

  const configResult = GoogleConnector.configGuard.safeParse(googleOneTapConnector.dbEntry.config);

  if (!configResult.success) {
    throw new RequestError({
      code: 'connector.invalid_config',
      status: 400,
      details: configResult.error.flatten(),
    });
  }

  return { connector: googleOneTapConnector, config: configResult.data };
};

export default function googleOneTapVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, tenantContext: TenantContext) {
  const {
    libraries,
    queries,
    connectors: { getLogtoConnectors },
  } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/google-one-tap/verify`,
    koaGuard({
      body: googleOneTapVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.GoogleOneTap,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { verificationAuditLog } = ctx;
      const { credential } = ctx.guard.body;

      verificationAuditLog.append({ payload: { credential } });

      const {
        connector: {
          dbEntry: { id: connectorId },
        },
      } = await getGoogleOneTapConnector(getLogtoConnectors);

      const googleOneTapVerificationRecord = GoogleOneTapVerification.create(
        libraries,
        queries,
        connectorId
      );

      ctx.experienceInteraction.setVerificationRecord(googleOneTapVerificationRecord);

      await googleOneTapVerificationRecord.verify(credential);

      // Skip CAPTCHA for Google One Tap flow
      ctx.experienceInteraction.skipCaptcha();
      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: googleOneTapVerificationRecord.id,
      };

      return next();
    }
  );
}
