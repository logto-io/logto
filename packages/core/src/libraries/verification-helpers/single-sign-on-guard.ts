import { type SocialUserInfo } from '@logto/connector-kit';
import { type IdentifierPayload, type SignInExperience } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { type SsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import assertThat from '#src/utils/assert-that.js';

// Guard the SSO only email identifier
export const verifySsoOnlyEmailIdentifier = async (
  { getAvailableSsoConnectors }: SsoConnectorLibrary,
  identifier: IdentifierPayload | SocialUserInfo,
  signInExperience: SignInExperience
) => {
  if (!('email' in identifier) || !identifier.email) {
    return;
  }

  // SSO is not enabled
  if (!signInExperience.singleSignOnEnabled) {
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
