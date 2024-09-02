import { assert, conditional } from '@silverhand/essentials';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  SocialUserInfo,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';
import {
  constructAuthorizationUri,
  oauth2AuthResponseGuard,
  requestTokenEndpoint,
  TokenEndpointAuthMethod,
} from '@logto/connector-oauth';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  mandatoryScope,
  defaultScopes,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
  tokenEndpoint,
} from './constant.js';
import { accessTokenResponseGuard, gitlabConfigGuard, userInfoResponseGuard } from './types.js';

/**
 * Generates an authorization URI for the given configuration.
 *
 * @param {GetConnectorConfig} getConfig - Function to retrieve the connector configuration.
 * @return {GetAuthorizationUri} - A function that generates the authorization URI.
 */
const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, gitlabConfigGuard);

    const { clientId, scope } = config;

    await setSession({ redirectUri });

    const scopes = scope?.split(' ') ?? defaultScopes;
    const scopesWithRequired = scopes.includes(mandatoryScope)
      ? scopes
      : [...scopes, mandatoryScope];

    return constructAuthorizationUri(authorizationEndpoint, {
      responseType: 'code',
      clientId,
      scope: scopesWithRequired.join(' '), // Defaults to mandatoryScope if not provided
      redirectUri,
      state,
    });
  };

/**
 * Asynchronously fetches user information from a social media provider.
 *
 * @param {GetConnectorConfig} getConfig - A function to get the connector configuration.
 *
 * @returns {GetUserInfo} - A function that retrieves user information.
 *
 * @throws {ConnectorError} - If an error occurs during the retrieval of user information.
 */
const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession): Promise<SocialUserInfo> => {
    const authResponseResult = oauth2AuthResponseGuard.safeParse(data);

    if (!authResponseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, data);
    }

    const { code } = authResponseResult.data;

    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, gitlabConfigGuard);

    const { clientId, clientSecret } = config;
    const { redirectUri } = await getSession();

    if (!redirectUri) {
      throw new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      });
    }

    const tokenResponse = await requestTokenEndpoint({
      tokenEndpoint,
      tokenEndpointAuthOptions: {
        method: TokenEndpointAuthMethod.ClientSecretBasic,
      },
      tokenRequestBody: {
        grantType: 'authorization_code',
        code,
        redirectUri,
        clientId,
        clientSecret,
      },
    });

    const parsedTokenResponse = accessTokenResponseGuard.safeParse(await tokenResponse.json());

    if (!parsedTokenResponse.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsedTokenResponse.error);
    }

    const { access_token: accessToken, token_type: tokenType } = parsedTokenResponse.data;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    try {
      const userInfoResponse = await ky.get(userInfoEndpoint, {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const rawData = parseJson(await userInfoResponse.text());

      const parsedUserInfoResponse = userInfoResponseGuard.safeParse(rawData);

      if (!parsedUserInfoResponse.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsedUserInfoResponse.error);
      }

      const { email, email_verified, name, picture: avatar, sub: id } = parsedUserInfoResponse.data;

      return {
        id,
        ...conditional(email_verified && { email }),
        name,
        avatar,
        rawData,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { response } = error;

        if (response.status === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, await response.text());
      }

      throw error;
    }
  };

/**
 * Creates a GitLab connector.
 *
 * @param {Object} options - Options for creating the connector.
 * @param {Function} options.getConfig - Function used to get configuration options.
 * @returns {Object} - GitLab connector object.
 */
const createGitLabConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: gitlabConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createGitLabConnector;
