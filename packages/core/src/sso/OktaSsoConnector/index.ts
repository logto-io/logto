import { SsoProviderName } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

import assertThat from '#src/utils/assert-that.js';

import { fetchToken, getUserInfo, getIdTokenClaims } from '../OidcConnector/utils.js';
import { OidcSsoConnector } from '../OidcSsoConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { SsoConnectorError, SsoConnectorErrorCodes } from '../types/error.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';
import { type ExtendedSocialUserInfo } from '../types/saml.js';
import { type SingleSignOnConnectorSession } from '../types/session.js';

import { logoBase64, logoDarkBase64 } from './consts.js';

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
      new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'The access token is missing from the response.',
      })
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
  logo: logoBase64,
  logoDark: logoDarkBase64,
  description: {
    de: 'Zentralisiertes Identitätsmanagement für Kunden, Mitarbeiter und Partner.',
    en: 'Centralizes identity management for customers, employees, and partners.',
    es: 'Gestión centralizada de identidad para clientes, empleados y socios.',
    fr: "Gestion centralisée de l'identité pour les clients, les employés et les partenaires.",
    it: "Gestione centralizzata dell'identità per clienti, dipendenti e partner.",
    ja: '顧客、従業員、パートナーのためのアイデンティティ管理の集中化。',
    ko: '고객, 직원 및 파트너를 위한 신원 관리의 중앙화.',
    'pl-PL': 'Centralizacja zarządzania tożsamością dla klientów, pracowników i partnerów.',
    'pt-BR': 'Centraliza a gestão de identidade para clientes, funcionários e parceiros.',
    'pt-PT': 'Centraliza a gestão de identidade para clientes, funcionários e parceiros.',
    ru: 'Централизованное управление идентификацией для клиентов, сотрудников и партнеров.',
    'tr-TR': 'Müşteriler, çalışanlar ve ortaklar için kimlik yönetimini merkezileştirir.',
    'zh-CN': '集中管理客户、员工和合作伙伴的身份。',
    'zh-HK': '集中管理客戶、員工和合作夥伴的身份。',
    'zh-TW': '集中管理客戶、員工和合作夥伴的身份。',
  },
  name: {
    en: 'Okta',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: OktaSsoConnector,
};
