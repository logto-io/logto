import { GoogleConnector } from '@logto/connector-kit';
import {
  googleOneTapVerificationVerifyPayloadGuard,
  VerificationType,
  ConnectorType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
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

const consoleLog = new ConsoleLog(chalk.magenta('GoogleOneTap'));

/**
 * Get and validate Google One Tap connector configuration
 */
const getGoogleOneTapConnector = async (getLogtoConnectors: () => Promise<LogtoConnector[]>) => {
  const connectors = await getLogtoConnectors();

  consoleLog.info(
    '[GoogleOneTap] Debug: Available connectors:',
    connectors.map((c) => ({
      id: c.dbEntry.id,
      type: c.type,
      metadataId: c.metadata.id,
      target: c.metadata.target,
      factoryId: GoogleConnector.factoryId,
    }))
  );

  const googleOneTapConnector = connectors.find(
    (connector) =>
      connector.type === ConnectorType.Social && connector.metadata.id === GoogleConnector.factoryId
  );

  consoleLog.info(
    '[GoogleOneTap] Debug: Found Google connector:',
    googleOneTapConnector
      ? {
          id: googleOneTapConnector.dbEntry.id,
          type: googleOneTapConnector.type,
          metadataId: googleOneTapConnector.metadata.id,
          target: googleOneTapConnector.metadata.target,
        }
      : 'null'
  );

  if (!googleOneTapConnector) {
    consoleLog.error(
      '[GoogleOneTap] Error: Google connector not found. Expected factoryId:',
      GoogleConnector.factoryId
    );
    throw new RequestError({
      code: 'connector.not_found',
      status: 404,
      details: `Google connector with factoryId "${GoogleConnector.factoryId}" not found. Available connectors: ${connectors.map((c) => c.metadata.id).join(', ')}`,
    });
  }

  const configResult = GoogleConnector.configGuard.safeParse(googleOneTapConnector.dbEntry.config);

  if (!configResult.success) {
    consoleLog.error(
      '[GoogleOneTap] Error: Invalid connector config:',
      configResult.error.flatten()
    );
    throw new RequestError({
      code: 'connector.invalid_config',
      status: 400,
      details: configResult.error.flatten(),
    });
  }

  consoleLog.info(
    '[GoogleOneTap] Debug: Successfully found and validated Google connector with ID:',
    googleOneTapConnector.dbEntry.id
  );
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
        verifiedEmail: z.string(),
      }),
      status: [200, 400, 404, 422],
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

      consoleLog.info(
        '[GoogleOneTap] Debug: Using connector ID from getGoogleOneTapConnector:',
        connectorId
      );

      // Verify that the connector can be retrieved by the Social library
      try {
        await libraries.socials.getConnector(connectorId);
        consoleLog.info(
          '[GoogleOneTap] Debug: Connector ID verified successfully with Social library'
        );
      } catch (error) {
        consoleLog.error('[GoogleOneTap] Error: Connector ID verification failed:', error);
        throw new RequestError({
          code: 'session.invalid_connector_id',
          status: 422,
          details: `Google connector verification failed with ID: ${connectorId}`,
          connectorId,
        });
      }

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
        verifiedEmail: googleOneTapVerificationRecord.verifiedEmail,
      };

      return next();
    }
  );
}
