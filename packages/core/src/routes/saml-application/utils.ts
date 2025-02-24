import { type Nullable } from '@silverhand/essentials';
import { type Context } from 'koa';

import { spInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const verifyAndGetSamlSessionData = async (
  ctx: Context,
  queries: Queries['samlApplicationSessions'],
  state?: string
): Promise<{
  relayState: Nullable<string>;
  samlRequestId: Nullable<string>;
  sessionId?: string;
  sessionExpiresAt?: string;
}> => {
  if (!state) {
    return {
      relayState: null,
      samlRequestId: null,
    };
  }

  const sessionId = ctx.cookies.get(spInitiatedSamlSsoSessionCookieName);
  assertThat(sessionId, 'application.saml.sp_initiated_saml_sso_session_not_found_in_cookies');
  const session = await queries.findSessionById(sessionId);
  assertThat(session, 'application.saml.sp_initiated_saml_sso_session_not_found');

  const { relayState, samlRequestId } = session;
  const sessionExpiresAt = new Date(session.expiresAt).toISOString();

  assertThat(session.oidcState === state, 'application.saml.state_mismatch');

  return {
    relayState,
    samlRequestId,
    sessionId,
    sessionExpiresAt,
  };
};
