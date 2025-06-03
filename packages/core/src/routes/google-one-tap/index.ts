import { GoogleConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { ConsoleLog, generateStandardId, generateStandardSecret } from '@logto/shared';
import { trySafe, tryThat } from '@silverhand/essentials';
import chalk from 'chalk';
import { addSeconds } from 'date-fns';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context } from 'koa';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import koaGuard from '../../middleware/koa-guard.js';
import type { AnonymousRouter } from '../types.js';

const consoleLog = new ConsoleLog(chalk.magenta('google-one-tap'));

// Default expiration time: 10 minutes.
const defaultExpiresTime = 10 * 60;

// Google JWKS URI for token verification
const googleJwksUri = 'https://www.googleapis.com/oauth2/v3/certs';

// List of allowed local development origins
const localDevelopmentOrigins = [
  'localhost', // Localhost with any port
  '127.0.0.1', // IPv4 loopback
  '0.0.0.0', // All interfaces
  '[::1]', // IPv6 loopback
  '.local', // MDNS domains (especially for macOS)
  'host.docker.internal', // Docker host from container
];

/**
 * Check CORS origin and set appropriate headers
 */
const setCorsHeaders = (ctx: Context, allowedMethods: string) => {
  const origin = ctx.get('origin');
  consoleLog.info(`origin: ${origin}`);

  const { isProduction, isIntegrationTest } = EnvSet.values;

  // Allow local development origins
  if (
    (!isProduction || isIntegrationTest) &&
    localDevelopmentOrigins.some((item) => origin.includes(item))
  ) {
    ctx.set('Access-Control-Allow-Origin', origin);
  }
  // In production, only allow *.logto.io or *.logto.dev domains to access
  else if (isProduction && (origin.endsWith('.logto.io') || origin.endsWith('.logto.dev'))) {
    ctx.set('Access-Control-Allow-Origin', origin);
  } else {
    throw new RequestError({ code: 'auth.forbidden', status: 403 });
  }

  ctx.set('Access-Control-Allow-Methods', allowedMethods);
  ctx.set('Access-Control-Allow-Headers', 'Content-Type');
};

/**
 * Handle OPTIONS preflight requests
 */
const handleOptionsRequest = async (ctx: Context, next: () => Promise<void>) => {
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return next();
  }
};

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
      setCorsHeaders(ctx, 'GET, OPTIONS');

      await handleOptionsRequest(ctx, next);

      const { isProduction, isIntegrationTest } = EnvSet.values;
      consoleLog.info(`isProduction: ${isProduction}`);
      consoleLog.info(`isIntegrationTest: ${isIntegrationTest}`);

      const { config } = await getGoogleOneTapConnector(getLogtoConnectors);
      const { clientId, oneTap } = config;

      ctx.status = 200;
      ctx.body = { clientId, oneTap };
      return next();
    }
  );

  router.post(
    '/google-one-tap/verify',
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
      setCorsHeaders(ctx, 'POST, OPTIONS');

      await handleOptionsRequest(ctx, next);

      const { idToken } = ctx.guard.body;

      const { config } = await getGoogleOneTapConnector(getLogtoConnectors);
      const { clientId } = config;

      // Verify Google ID Token
      const { payload } = await tryThat(
        async () =>
          jwtVerify(idToken, createRemoteJWKSet(new URL(googleJwksUri)), {
            issuer: ['https://accounts.google.com', 'accounts.google.com'],
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
