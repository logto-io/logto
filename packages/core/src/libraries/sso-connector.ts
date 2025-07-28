import { appInsights } from '@logto/app-insights/node';
import { type DirectSignInOptions, Prompt, QueryKey, ReservedScope, UserScope } from '@logto/js';
import {
  ApplicationType,
  type SsoSamlAssertionContent,
  type CreateSsoConnectorIdpInitiatedAuthConfig,
  type SupportedSsoConnector,
  type SsoConnectorIdpInitiatedAuthConfig,
  type EncryptedTokenSet,
  type SecretEnterpriseSsoConnectorRelationPayload,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert, deduplicate, trySafe } from '@silverhand/essentials';

import { defaultIdPInitiatedSamlSsoSessionTtl } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { isSupportedSsoConnector } from '#src/sso/utils.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { type OmitAutoSetFields } from '#src/utils/sql.js';

import OidcConnector from '../sso/OidcConnector/index.js';
import {
  deserializeEncryptedSecret,
  encryptTokenResponse,
  isValidAccessTokenResponse,
} from '../utils/secret-encryption.js';

export type SsoConnectorLibrary = ReturnType<typeof createSsoConnectorLibrary>;

export const createSsoConnectorLibrary = (queries: Queries) => {
  const { ssoConnectors, applications } = queries;

  const getSsoConnectors = async (
    limit?: number,
    offset?: number
  ): Promise<[number, readonly SupportedSsoConnector[]]> => {
    const [count, entities] = await ssoConnectors.findAll(limit, offset);

    return [
      count,
      entities.filter((connector): connector is SupportedSsoConnector =>
        isSupportedSsoConnector(connector)
      ),
    ];
  };

  const getAvailableSsoConnectors = async () => {
    const [_, connectors] = await getSsoConnectors();

    return connectors.filter(({ providerName, config, domains }) => {
      const factory = ssoConnectorFactories[providerName];
      const hasValidConfig = factory.configGuard.safeParse(config).success;
      const hasValidDomains = domains.length > 0;

      return hasValidConfig && hasValidDomains;
    });
  };

  const getSsoConnectorById = async (id: string) => {
    const connector = await ssoConnectors.findById(id);

    // Return 404 if the connector is not supported
    assert(
      isSupportedSsoConnector(connector),
      new RequestError({
        code: 'connector.not_found',
        status: 404,
      })
    );

    return connector;
  };

  /**
   * Creates a new IdP-initiated authentication configuration for a SSO connector.
   *
   * @throws {RequestError} Throws a 404 error if the application is not found
   * @throws {RequestError} Throws a 400 error if the application type is not supported
   * @throws {RequestError} Throws a 400 error if the redirect URI is not registered
   */
  const createSsoConnectorIdpInitiatedAuthConfig = async (
    data: OmitAutoSetFields<CreateSsoConnectorIdpInitiatedAuthConfig>
  ) => {
    const {
      defaultApplicationId,
      redirectUri,
      autoSendAuthorizationRequest,
      clientIdpInitiatedAuthCallbackUri,
    } = data;

    // Throws an 404 error if the application is not found
    const application = await applications.findApplicationById(defaultApplicationId);

    // Authorization request initiated by Logto server
    if (autoSendAuthorizationRequest) {
      // Only first-party traditional web applications or SAML applications are allowed
      assertThat(
        (application.type === ApplicationType.Traditional && !application.isThirdParty) ||
          application.type === ApplicationType.SAML,
        new RequestError({
          code: 'single_sign_on.idp_initiated_authentication_invalid_application_type',
          type: `${ApplicationType.Traditional}, ${ApplicationType.SAML}`,
          status: 400,
        })
      );

      // If the redirect URI is provided, it must be one of the registered redirect URIs of the application
      assertThat(
        !redirectUri || application.oidcClientMetadata.redirectUris.includes(redirectUri),
        new RequestError('single_sign_on.idp_initiated_authentication_redirect_uri_not_registered')
      );
    } else {
      // Authorization request initiated by the client

      // Only first-party traditional web applications, SPAs, or SAML applications are allowed
      assertThat(
        (application.type === ApplicationType.Traditional && !application.isThirdParty) ||
          application.type === ApplicationType.SPA ||
          application.type === ApplicationType.SAML,
        new RequestError({
          code: 'single_sign_on.idp_initiated_authentication_invalid_application_type',
          type: `${ApplicationType.Traditional}, ${ApplicationType.SPA}, ${ApplicationType.SAML}`,
          status: 400,
        })
      );

      // Fallback validation for the clientIdpInitiatedAuthCallbackUri
      assertThat(
        clientIdpInitiatedAuthCallbackUri,
        new RequestError({
          code: 'guard.invalid_input',
          message: 'clientIdpInitiatedAuthCallbackUri is required',
        })
      );
    }

    return ssoConnectors.insertIdpInitiatedAuthConfig(data);
  };

  /**
   * Records the verified SAML assertion content to the database.
   * @remarks
   * For IdP-initiated SAML SSO flow use only.
   * Save the SAML assertion content to the database
   * The session ID will be used to retrieve the SAML assertion content when the user is redirected to Logto SSO authentication flow.
   */
  const createIdpInitiatedSamlSsoSession = async (
    connectorId: string,
    assertionContent: SsoSamlAssertionContent
  ) => {
    // If the assertion has a notOnOrAfter condition, we will use it as the expiration date,
    // otherwise use the creation date + 10 minutes
    const expiresAt = assertionContent.conditions?.notOnOrAfter
      ? new Date(assertionContent.conditions.notOnOrAfter)
      : new Date(Date.now() + defaultIdPInitiatedSamlSsoSessionTtl);

    return ssoConnectors.insertIdpInitiatedSamlSsoSession({
      id: generateStandardId(),
      connectorId,
      assertionContent,
      expiresAt: expiresAt.valueOf(),
    });
  };

  /**
   * Build the IdP initiated SAML SSO authentication sign-in URL.
   *
   * @remarks
   * For IdP-initiated SAML SSO flow use only. Generate the sign-in URL for the user to sign in.
   * Default scopes: openid, profile
   * Default prompt: login
   * Default response type: code
   *
   * @param issuer The oidc issuer endpoint of the current tenant.
   * @param authConfig The IdP-initiated SAML SSO authentication configuration.
   *
   * @throw {RequestError} Throws a 400 error if the redirect URI is not provided and the default application does not have a registered redirect URI.
   */
  const getIdpInitiatedSamlSsoSignInUrl = async (
    issuer: string,
    authConfig: SsoConnectorIdpInitiatedAuthConfig
  ) => {
    const {
      connectorId,
      defaultApplicationId,
      authParameters: { scope, ...extraParams },
    } = authConfig;

    // Get the first registered redirect URI of the default application if not provided
    const redirectUri =
      authConfig.redirectUri ??
      (await trySafe(async () => {
        const { oidcClientMetadata } = await applications.findApplicationById(defaultApplicationId);
        return oidcClientMetadata.redirectUris[0];
      }));

    if (!redirectUri) {
      throw new RequestError('oidc.invalid_redirect_uri');
    }

    const directSignInOptions: DirectSignInOptions = {
      method: 'sso',
      target: connectorId,
    };

    const queryParameters = new URLSearchParams({
      [QueryKey.ClientId]: defaultApplicationId,
      [QueryKey.RedirectUri]: redirectUri,
      [QueryKey.ResponseType]: 'code',
      [QueryKey.Prompt]: Prompt.Login,
      [QueryKey.DirectSignIn]: `${directSignInOptions.method}:${directSignInOptions.target}`,
      ...extraParams,
    });

    queryParameters.append(
      QueryKey.Scope,
      // For security reasons, DO NOT include the offline_access scope for IdP-initiated SAML SSO by default
      deduplicate([ReservedScope.OpenId, UserScope.Profile, ...(scope?.split(' ') ?? [])]).join(' ')
    );

    return new URL(`${issuer}/auth?${queryParameters.toString()}`);
  };

  const upsertEnterpriseSsoTokenSetSecret = async (
    userId: string,
    {
      encryptedTokenSet,
      enterpriseSsoConnectorRelationPayload,
    }: {
      encryptedTokenSet: EncryptedTokenSet;
      enterpriseSsoConnectorRelationPayload: SecretEnterpriseSsoConnectorRelationPayload;
    }
  ) => {
    const { encryptedTokenSetBase64, metadata } = encryptedTokenSet;

    try {
      await queries.secrets.upsertEnterpriseSsoTokenSetSecret(
        {
          id: generateStandardId(),
          userId,
          ...deserializeEncryptedSecret(encryptedTokenSetBase64),
          metadata,
        },
        enterpriseSsoConnectorRelationPayload
      );
    } catch (error: unknown) {
      // Upsert token set secret should not break the normal social authentication and link flow
      void appInsights.trackException(error);
    }
  };

  /**
   * Refreshes the token set secret by using the provided refresh token.
   *
   * - Fetches the latest token response using the refresh token.
   * - Updates the secret using the latest encrypted token response.
   * - Returns the access token and metadata from the updated secret.
   */
  const refreshTokenSetSecret = async (
    ssoConnectorId: string,
    secretId: string,
    refreshToken: string
  ) => {
    const connector = await getSsoConnectorById(ssoConnectorId);
    const connectorInstance = new ssoConnectorFactories[connector.providerName].constructor(
      connector,
      // Placeholder, not used in OIDC SSO connectors
      // Avoid importing unnecessary envSet to this method
      new URL('http://auth.logto.io')
    );

    assertThat(
      connectorInstance instanceof OidcConnector && connector.enableTokenStorage,
      new RequestError({
        code: 'connector.token_storage_not_supported',
        status: 422,
      })
    );

    const tokenResponse = await connectorInstance.getTokenByRefreshToken(refreshToken);

    assertThat(
      isValidAccessTokenResponse(tokenResponse),
      new RequestError('connector.invalid_response')
    );

    // This is to ensure that the refresh token is included in the updated token response.
    // For some providers like Google, the refresh token is issued only once during the initial authorization.
    // We need keep the original refresh token in the updated token response.
    // If new refresh token is returned, it will replace the original one.
    const updatedTokenResponse: typeof tokenResponse = {
      refresh_token: refreshToken,
      ...tokenResponse,
    };

    const { tokenSecret, metadata } = encryptTokenResponse(updatedTokenResponse);
    const { access_token } = updatedTokenResponse;

    await queries.secrets.updateById(secretId, {
      ...tokenSecret,
      metadata,
    });

    return {
      access_token,
      metadata,
    };
  };

  return {
    getSsoConnectors,
    getAvailableSsoConnectors,
    getSsoConnectorById,
    createSsoConnectorIdpInitiatedAuthConfig,
    createIdpInitiatedSamlSsoSession,
    getIdpInitiatedSamlSsoSignInUrl,
    upsertEnterpriseSsoTokenSetSecret,
    refreshTokenSetSecret,
  };
};
