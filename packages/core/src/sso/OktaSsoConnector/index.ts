import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { SsoProviderName } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

import assertThat from '#src/utils/assert-that.js';

import { fetchToken, getUserInfo, getIdTokenClaims } from '../OidcConnector/utils.js';
import { OidcSsoConnector } from '../OidcSsoConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';
import { type ExtendedSocialUserInfo } from '../types/saml.js';
import { type SingleSignOnConnectorSession } from '../types/session.js';

export class OktaSsoConnector extends OidcSsoConnector {
  /**
   * Override the getUserInfo method from the OidcSsoConnector class
   *
   * @remark Okta's IdToken does not include the sufficient user claims like email_verified, phone_verified, etc. {@link https://devforum.okta.com/t/email-verified-claim/3516/2}
   * This method will fetch the user info from the userinfo endpoint instead.
   */
  override async getUserInfo(
    connectorSession: SingleSignOnConnectorSession,
    data: unknown
  ): Promise<ExtendedSocialUserInfo> {
    const oidcConfig = await this.getOidcConfig();
    const { nonce, redirectUri } = connectorSession;

    // Fetch token from the OIDC provider using authorization code
    const { idToken, accessToken } = await fetchToken(oidcConfig, data, redirectUri);

    assertThat(
      accessToken,
      new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, 'access_token is empty.')
    );

    // Verify the id token and get the user id
    const { sub: id } = await getIdTokenClaims(idToken, oidcConfig, nonce);

    // Fetch user info from the userinfo endpoint
    const { sub, name, picture, email, email_verified, phone, phone_verified, ...rest } =
      await getUserInfo(accessToken, oidcConfig.userinfoEndpoint);

    return {
      id,
      ...conditional(name && { name }),
      ...conditional(picture && { avatar: picture }),
      ...conditional(email && email_verified && { email }),
      ...conditional(phone && phone_verified && { phone }),
      ...camelcaseKeys(rest),
    };
  }
}

export const oktaSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.OKTA> = {
  providerName: SsoProviderName.OKTA,
  logo: 'https://logtodev.blob.core.windows.net/public-blobs/admin/r2a6qctI3lmG/2023/11/22/8bvg68e7/OKTA.D.png',
  description: {
    en: 'This connector is used to connect with Okta Single Sign-On.',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: OktaSsoConnector,
};
