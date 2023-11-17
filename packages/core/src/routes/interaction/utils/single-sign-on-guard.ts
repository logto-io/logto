import { type SocialUserInfo } from '@logto/connector-kit';
import { type IdentifierPayload } from '@logto/schemas';
import { type Context } from 'koa';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import {
  type SingleSignOnConnectorSession,
  singleSignOnConnectorSessionGuard,
} from '#src/sso/types/session.js';
import assertThat from '#src/utils/assert-that.js';

// Guard the SSO only email identifier
export const verifySsoOnlyEmailIdentifier = async (
  { getAvailableSsoConnectors }: SsoConnectorLibrary,
  identifier: IdentifierPayload | SocialUserInfo
) => {
  // TODO: @simeng-li remove the dev features check when the SSO feature is released
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  if (!('email' in identifier) || !identifier.email) {
    return;
  }

  const { email } = identifier;
  const availableSsoConnectors = await getAvailableSsoConnectors();
  const domain = email.split('@')[1];

  // Invalid email domain
  if (!domain) {
    return;
  }

  const availableConnectors = availableSsoConnectors.filter(({ domains }) =>
    domains.includes(domain)
  );

  assertThat(
    availableConnectors.length === 0,
    new RequestError(
      {
        code: 'session.sso_enabled',
        status: 422,
      },
      {
        ssoConnectors: availableConnectors,
      }
    )
  );
};

/**
 * Get the single sign on session data from the oidc provider session storage.
 *
 * @remark Forked from ./social-verification.ts.
 * Use SingleSignOnSession guard instead of ConnectorSession guard.
 */
export const getSingleSignOnSessionResult = async (
  ctx: Context,
  provider: Provider
): Promise<SingleSignOnConnectorSession> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const singleSignOnSessionResult = z
    .object({
      connectorSession: singleSignOnConnectorSessionGuard,
    })
    .safeParse(result);

  assertThat(
    result && singleSignOnSessionResult.success,
    'session.connector_validation_session_not_found'
  );

  // Clear the session after the session data is retrieved
  const { connectorSession, ...rest } = result;
  await provider.interactionResult(ctx.req, ctx.res, {
    ...rest,
  });

  return singleSignOnSessionResult.data.connectorSession;
};
