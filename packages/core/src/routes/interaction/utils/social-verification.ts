import { ConnectorType } from '@logto/schemas';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import assertThat from '#src/utils/assert-that.js';

import type { SocialAuthorizationUrlPayload } from '../types/guard.js';

export const createSocialAuthorizationUrl = async (payload: SocialAuthorizationUrlPayload) => {
  const { connectorId, state, redirectUri } = payload;
  assertThat(state && redirectUri, 'session.insufficient_info');

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.dbEntry.enabled, 'connector.not_enabled');
  assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

  return connector.getAuthorizationUri({ state, redirectUri });
};
