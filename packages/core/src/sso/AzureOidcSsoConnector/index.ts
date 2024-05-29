import { SsoProviderName, SsoProviderType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';
import { decodeJwt } from 'jose';

import assertThat from '#src/utils/assert-that.js';

import { fetchToken, getIdTokenClaims, getUserInfo } from '../OidcConnector/utils.js';
import { OidcSsoConnector } from '../OidcSsoConnector/index.js';
import { type SingleSignOnFactory } from '../index.js';
import { SsoConnectorError, SsoConnectorErrorCodes } from '../types/error.js';
import { basicOidcConnectorConfigGuard } from '../types/oidc.js';
import { type ExtendedSocialUserInfo } from '../types/saml.js';
import { type SingleSignOnConnectorSession } from '../types/session.js';

export class AzureOidcSsoConnector extends OidcSsoConnector {
  /**
   * Handle the sign-in callback from the OIDC provider and return the user info
   *
   * @param data unknown oidc authorization response
   * @param connectorSession The connector session data from the oidc provider session storage
   * @returns The user info from the OIDC provider
   *
   * @remarks folked from OidcSsoConnector. Override the getUserInfo method's sync user info logic.
   * The email_verified and phone_verified are returned from Azure AD's userinfo endpoint.
   * @see https://learn.microsoft.com/en-us/answers/questions/812672/microsoft-openid-connect-getting-verified-email
   * It is unsafe to trust the unverified email and phone number in Logto's context. As we are using the verified email and phone number to identify the user.
   * Store extra unverified_email and unverified_phone fields in the user SSO identity profile instead.
   */
  // eslint-disable-next-line complexity
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

    // Need to decode the id token to get the tenant id
    const decodeToken = decodeJwt(idToken);

    // For multi-tenancy Azure application, the issuer may contain the tenant id placeholder
    // Replace the placeholder with the tid retrieved from the id token
    // @see https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens#validation-of-the-signing-key-issuer
    const jwtVerifyOptions =
      oidcConfig.issuer.includes('{tenantid}') && typeof decodeToken.tid === 'string'
        ? { issuer: oidcConfig.issuer.replace('{tenantid}', decodeToken.tid) }
        : {};

    // Verify the id token and get the user id
    const { sub: id } = await getIdTokenClaims(idToken, oidcConfig, nonce, jwtVerifyOptions);

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
      ...conditional(email && !email_verified && { unverifiedEmail: email }),
      ...conditional(phone && !phone_verified && { unverifiedPhone: phone }),
    };
  }
}

export const azureOidcSsoConnectorFactory: SingleSignOnFactory<SsoProviderName.AZURE_AD_OIDC> = {
  providerName: SsoProviderName.AZURE_AD_OIDC,
  providerType: SsoProviderType.OIDC,
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMDY5MzQgMTguNzA5N0M1LjU4NjY3IDE5LjAzMjMgNi40NDY2NyAxOS4zOTEgNy4zNTYgMTkuMzkxQzguMTg0IDE5LjM5MSA4Ljk1MzM0IDE5LjE1MSA5LjU5MDY3IDE4Ljc0MTdDOS41OTA2NyAxOC43NDE3IDkuNTkyIDE4Ljc0MTcgOS41OTMzNCAxOC43NDAzTDEyIDE3LjIzNjNWMjIuNjY3QzExLjYxODcgMjIuNjY3IDExLjIzNDcgMjIuNTYzIDEwLjkwMTMgMjIuMzU1TDUuMDY5MzQgMTguNzA5N1oiIGZpbGw9IiMyMjUwODYiLz4KPHBhdGggZD0iTTEwLjQ3MDcgMi4wMDkwMUwwLjQ3MDY2MiAxMy4yODlDLTAuMzAxMzM4IDE0LjE2MSAtMC4xMDAwMDUgMTUuNDc4MyAwLjkwMTMyOCAxNi4xMDM3QzAuOTAxMzI4IDE2LjEwMzcgNC42MDI2NiAxOC40MTcgNS4wNjkzMyAxOC43MDlDNS41ODY2NiAxOS4wMzE3IDYuNDQ2NjYgMTkuMzkwMyA3LjM1NTk5IDE5LjM5MDNDOC4xODM5OSAxOS4zOTAzIDguOTUzMzMgMTkuMTUwMyA5LjU5MDY2IDE4Ljc0MUM5LjU5MDY2IDE4Ljc0MSA5LjU5MTk5IDE4Ljc0MSA5LjU5MzMzIDE4LjczOTdMMTIgMTcuMjM1N0w2LjE4MTMzIDEzLjU5ODNMMTIuMDAxMyA3LjAzMzAxVjEuMzMzMDFDMTEuNDM2IDEuMzMzMDEgMTAuODcwNyAxLjU1ODM0IDEwLjQ3MDcgMi4wMDkwMVoiIGZpbGw9IiM2NkRERkYiLz4KPHBhdGggZD0iTTYuMTgxMjcgMTMuNTk5NUw2LjI1MDYxIDEzLjY0MjJMMTEuOTk5OSAxNy4yMzY4SDEyLjAwMTNWNy4wMzU1MUwxMS45OTk5IDcuMDM0MThMNi4xODEyNyAxMy41OTk1WiIgZmlsbD0iI0NCRjhGRiIvPgo8cGF0aCBkPSJNMjMuMDk4NyAxNi4xMDRDMjQuMSAxNS40Nzg3IDI0LjMwMTMgMTQuMTYxMyAyMy41MjkzIDEzLjI4OTNMMTYuOTY4IDUuODg4QzE2LjQzODcgNS42NDEzMyAxNS44NDUzIDUuNSAxNS4yMTczIDUuNUMxMy45ODQgNS41IDEyLjg4MTMgNi4wMzIgMTIuMTQ4IDYuODY4TDEyLjAwMjcgNy4wMzJMMTcuODIxMyAxMy41OTczTDEyLjAwMTMgMTcuMjM0N1YyMi42NjUzQzEyLjM4NCAyMi42NjUzIDEyLjc2NTMgMjIuNTYxMyAxMy4wOTg3IDIyLjM1MzNMMjMuMDk4NyAxNi4xMDI3VjE2LjEwNFoiIGZpbGw9IiMwNzQ3OTMiLz4KPHBhdGggZD0iTTEyLjAwMTMgMS4zMzMwMVY3LjAzMzAxTDEyLjE0NjcgNi44NjkwMUMxMi44OCA2LjAzMzAxIDEzLjk4MjcgNS41MDEwMSAxNS4yMTYgNS41MDEwMUMxNS44NDUzIDUuNTAxMDEgMTYuNDM3MyA1LjY0MzY3IDE2Ljk2NjcgNS44ODkwMUwxMy41MjggMi4wMTAzNEMxMy4xMjkzIDEuNTU5NjcgMTIuNTY0IDEuMzM0MzQgMTIgMS4zMzQzNEwxMi4wMDEzIDEuMzMzMDFaIiBmaWxsPSIjMDI5NEU0Ii8+CjxwYXRoIGQ9Ik0xNy44MiAxMy41OTkyTDEyLjAwMTMgNy4wMzUxNlYxNy4yMzUyTDE3LjgyIDEzLjU5OTJaIiBmaWxsPSIjOTZCQ0MyIi8+Cjwvc3ZnPgo=',
  logoDark:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMDY5MzQgMTguNzA5N0M1LjU4NjY3IDE5LjAzMjMgNi40NDY2NyAxOS4zOTEgNy4zNTYgMTkuMzkxQzguMTg0IDE5LjM5MSA4Ljk1MzM0IDE5LjE1MSA5LjU5MDY3IDE4Ljc0MTdDOS41OTA2NyAxOC43NDE3IDkuNTkyIDE4Ljc0MTcgOS41OTMzNCAxOC43NDAzTDEyIDE3LjIzNjNWMjIuNjY3QzExLjYxODcgMjIuNjY3IDExLjIzNDcgMjIuNTYzIDEwLjkwMTMgMjIuMzU1TDUuMDY5MzQgMTguNzA5N1oiIGZpbGw9IiMyMjUwODYiLz4KPHBhdGggZD0iTTEwLjQ3MDcgMi4wMDkwMUwwLjQ3MDY2MiAxMy4yODlDLTAuMzAxMzM4IDE0LjE2MSAtMC4xMDAwMDUgMTUuNDc4MyAwLjkwMTMyOCAxNi4xMDM3QzAuOTAxMzI4IDE2LjEwMzcgNC42MDI2NiAxOC40MTcgNS4wNjkzMyAxOC43MDlDNS41ODY2NiAxOS4wMzE3IDYuNDQ2NjYgMTkuMzkwMyA3LjM1NTk5IDE5LjM5MDNDOC4xODM5OSAxOS4zOTAzIDguOTUzMzMgMTkuMTUwMyA5LjU5MDY2IDE4Ljc0MUM5LjU5MDY2IDE4Ljc0MSA5LjU5MTk5IDE4Ljc0MSA5LjU5MzMzIDE4LjczOTdMMTIgMTcuMjM1N0w2LjE4MTMzIDEzLjU5ODNMMTIuMDAxMyA3LjAzMzAxVjEuMzMzMDFDMTEuNDM2IDEuMzMzMDEgMTAuODcwNyAxLjU1ODM0IDEwLjQ3MDcgMi4wMDkwMVoiIGZpbGw9IiM2NkRERkYiLz4KPHBhdGggZD0iTTYuMTgxMjcgMTMuNTk5NUw2LjI1MDYxIDEzLjY0MjJMMTEuOTk5OSAxNy4yMzY4SDEyLjAwMTNWNy4wMzU1MUwxMS45OTk5IDcuMDM0MThMNi4xODEyNyAxMy41OTk1WiIgZmlsbD0iI0NCRjhGRiIvPgo8cGF0aCBkPSJNMjMuMDk4NyAxNi4xMDRDMjQuMSAxNS40Nzg3IDI0LjMwMTMgMTQuMTYxMyAyMy41MjkzIDEzLjI4OTNMMTYuOTY4IDUuODg4QzE2LjQzODcgNS42NDEzMyAxNS44NDUzIDUuNSAxNS4yMTczIDUuNUMxMy45ODQgNS41IDEyLjg4MTMgNi4wMzIgMTIuMTQ4IDYuODY4TDEyLjAwMjcgNy4wMzJMMTcuODIxMyAxMy41OTczTDEyLjAwMTMgMTcuMjM0N1YyMi42NjUzQzEyLjM4NCAyMi42NjUzIDEyLjc2NTMgMjIuNTYxMyAxMy4wOTg3IDIyLjM1MzNMMjMuMDk4NyAxNi4xMDI3VjE2LjEwNFoiIGZpbGw9IiMwNzQ3OTMiLz4KPHBhdGggZD0iTTEyLjAwMTMgMS4zMzMwMVY3LjAzMzAxTDEyLjE0NjcgNi44NjkwMUMxMi44OCA2LjAzMzAxIDEzLjk4MjcgNS41MDEwMSAxNS4yMTYgNS41MDEwMUMxNS44NDUzIDUuNTAxMDEgMTYuNDM3MyA1LjY0MzY3IDE2Ljk2NjcgNS44ODkwMUwxMy41MjggMi4wMTAzNEMxMy4xMjkzIDEuNTU5NjcgMTIuNTY0IDEuMzM0MzQgMTIgMS4zMzQzNEwxMi4wMDEzIDEuMzMzMDFaIiBmaWxsPSIjMDI5NEU0Ii8+CjxwYXRoIGQ9Ik0xNy44MiAxMy41OTkyTDEyLjAwMTMgNy4wMzUxNlYxNy4yMzUyTDE3LjgyIDEzLjU5OTJaIiBmaWxsPSIjOTZCQ0MyIi8+Cjwvc3ZnPgo=',
  description: {
    en: 'OpenID Connect on the Microsoft identity platform. Formerly known as Azure AD OIDC.',
    de: 'OpenID Connect auf der Microsoft-Identitätsplattform. Früher bekannt als Azure AD OIDC.',
    es: 'OpenID Connect en la plataforma de identidad de Microsoft. Anteriormente conocido como Azure AD OIDC.',
    fr: 'OpenID Connect sur la plateforme d’identité Microsoft. Anciennement connu sous le nom de Azure AD OIDC.',
    it: 'OpenID Connect sulla piattaforma di identità Microsoft. Precedentemente noto come Azure AD OIDC.',
    ja: 'Microsoft アイデンティティ プラットフォーム上の OpenID Connect. 以前は Azure AD OIDC として知られていました。',
    ko: 'Microsoft Identity 플랫폼에서 OpenID Connect. 이전에는 Azure AD OIDC로 알려져 있었습니다.',
    'pl-PL': 'OpenID Connect na platformie tożsamości Microsoft. Dawniej znany jako Azure AD OIDC.',
    'pt-BR':
      'OpenID Connect na plataforma de identidade da Microsoft. Anteriormente conhecido como Azure AD OIDC.',
    'pt-PT':
      'OpenID Connect na plataforma de identidade da Microsoft. Anteriormente conhecido como Azure AD OIDC.',
    ru: 'OpenID Connect на платформе идентификации Microsoft. Ранее известный как Azure AD OIDC.',
    'tr-TR':
      'Microsoft kimlik platformunda OpenID Connect. Eskiden Azure AD OIDC olarak bilinirdi.',
    'zh-CN': 'Microsoft 身份平台上的 OpenID Connect. 以前称为 Azure AD OIDC。',
    'zh-HK': 'Microsoft 身份平台上的 OpenID Connect. 以前稱為 Azure AD OIDC。',
    'zh-TW': 'Microsoft 身份平台上的 OpenID Connect. 以前稱為 Azure AD OIDC。',
  },

  name: {
    en: 'Microsoft Entra ID (OIDC)',
  },
  configGuard: basicOidcConnectorConfigGuard,
  constructor: AzureOidcSsoConnector,
};
