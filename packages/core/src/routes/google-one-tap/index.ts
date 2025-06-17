import { GoogleConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { ConsoleLog, generateStandardId, generateStandardSecret } from '@logto/shared';
import { trySafe, tryThat } from '@silverhand/essentials';
import chalk from 'chalk';
import { addSeconds } from 'date-fns';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { koaLogtoAnonymousMethodsCors } from '#src/middleware/koa-logto-anonymous-cors.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import koaGuard from '../../middleware/koa-guard.js';
import type { AnonymousRouter } from '../types.js';

const consoleLog = new ConsoleLog(chalk.magenta('google-one-tap'));

// Default expiration time: 10 minutes.
const defaultExpiresTime = 10 * 60;

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

export default function googleOneTapRoutes<T extends AnonymousRouter>(
  router: T,
  tenant: TenantContext
) {
  const {
    connectors: { getLogtoConnectors },
    queries: {
      users: { findUserByIdentity },
      oneTimeTokens: { insertOneTimeToken, updateExpiredOneTimeTokensStatusByEmail },
    },
  } = tenant;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.get(
    '/google-one-tap/config',
    koaLogtoAnonymousMethodsCors('GET'),
    koaGuard({
      status: [200, 204, 400, 403, 404],
      response: GoogleConnector.configGuard
        .pick({
          clientId: true,
          oneTap: true,
        })
        .optional(),
    }),
    async (ctx, next) => {
      const {
        config: { clientId, oneTap },
      } = await getGoogleOneTapConnector(getLogtoConnectors);

      ctx.status = 200;
      ctx.body = { clientId, oneTap };
      return next();
    }
  );

  router.post(
    '/google-one-tap/verify',
    koaLogtoAnonymousMethodsCors('POST'),
    koaGuard({
      body: z.object({
        idToken: z.string(),
      }),
      response: z.object({
        oneTimeToken: z.string(),
        isNewUser: z.boolean(),
        email: z.string(),
      }),
      status: [200, 204, 400, 403, 404],
    }),
    async (ctx, next) => {
      const { idToken } = ctx.guard.body;

      const {
        config: { clientId },
      } = await getGoogleOneTapConnector(getLogtoConnectors);

      // Verify Google ID Token
      const { payload } = await tryThat(
        async () =>
          jwtVerify(idToken, createRemoteJWKSet(new URL(GoogleConnector.jwksUri)), {
            issuer: GoogleConnector.issuer,
            audience: clientId,
            clockTolerance: 10,
          }),
        (error) => {
          throw new RequestError({
            code: 'session.google_one_tap.invalid_id_token',
            status: 400,
            details: error,
          });
        }
      );

      const { sub: googleUserId, email, email_verified } = payload;

      if (!email || !email_verified) {
        throw new RequestError({
          code: 'session.google_one_tap.unverified_email',
          status: 400,
        });
      }

      // Check if user exists with this Google identity
      const existingUser = await findUserByIdentity(GoogleConnector.target, String(googleUserId));
      const isNewUser = !existingUser;

      // Create one-time token with appropriate context
      const expiresAt = addSeconds(new Date(), defaultExpiresTime);
      const oneTimeToken = await insertOneTimeToken({
        id: generateStandardId(),
        email: String(email),
        token: generateStandardSecret(),
        expiresAt: expiresAt.getTime(),
        context: {
          // Add jitOrganizationIds if this is for registration
          ...(isNewUser && { jitOrganizationIds: [] }),
        },
      });

      // Clean up any expired tokens for this email
      await trySafe(
        async () => updateExpiredOneTimeTokensStatusByEmail(String(email)),
        (error) => {
          consoleLog.error('Failed to clean up expired tokens:', error);
        }
      );

      ctx.status = 200;
      ctx.body = {
        oneTimeToken: oneTimeToken.token,
        isNewUser,
        email: String(email),
      };

      return next();
    }
  );
}
