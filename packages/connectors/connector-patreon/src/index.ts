import { assert, conditional } from '@silverhand/essentials';

import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  jsonGuard,
} from '@logto/connector-kit';
import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  scope as defaultScope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { PatreonConfig } from './types.js';
import {
  authorizationCallbackErrorGuard,
  patreonConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

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
    validateConfig(config, patreonConfigGuard);
    const queryParameters = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope: config.scope ?? defaultScope,
    });

    await setSession({ redirectUri });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

/**
 * Handles the authorization callback for the application.
 *
 * @param {unknown} parameterObject - The parameter object to be handled.
 * @returns {Promise<any>} - A Promise that resolves to the data if the authorization is successful.
 * @throws {ConnectorError} - If there is an error during the authorization process.
 */
const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (result.success) {
    return result.data;
  }

  const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

  if (!parsedError.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  const { error, error_description, error_uri } = parsedError.data;

  if (error === 'access_denied') {
    throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, error_description);
  }

  throw new ConnectorError(ConnectorErrorCodes.General, {
    error,
    errorDescription: error_description,
    error_uri,
  });
};

/**
 * Retrieves an access token from Patreon using the provided configuration and parameters.
 *
 * @param {PatreonConfig} config - The Patreon configuration.
 * @param {Object} params - The parameters required for retrieving the access token.
 * @param {string} params.code - The authorization code from Patreon.
 * @param {string} params.redirectUri - The redirect URI used in the authorization process.
 * @returns {Object} - The retrieved access token.
 * @throws {ConnectorError} - If an error occurs during the retrieval process.
 */
export const getAccessToken = async (
  config: PatreonConfig,
  params: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = params;
  const { clientId: client_id, clientSecret: client_secret } = config;

  const requestParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id,
    client_secret,
    code,
    redirect_uri: redirectUri,
  });

  const httpResponse = await ky
    .post(accessTokenEndpoint, {
      searchParams: requestParams,
      timeout: defaultTimeout,
    })
    .json();

  const result = accessTokenResponseGuard.safeParse(httpResponse);
  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { access_token: accessToken } = result.data;

  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
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
  async (data, getSession) => {
    const { redirectUri } = await getSession();
    const { code } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, patreonConfigGuard); // Use a Patreon-specific config guard
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      })
    );
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    const authedApi = ky.create({
      timeout: defaultTimeout,
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.set('Authorization', `Bearer ${accessToken}`);
          },
        ],
      },
    });

    try {
      // Patreon-specific endpoint to fetch user details
      const userInfo = await authedApi.get(userInfoEndpoint).json();

      const userInfoResult = userInfoResponseGuard.safeParse(userInfo);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userInfoResult.error);
      }

      const { data } = userInfoResult.data;
      const { attributes } = data;

      return {
        id: String(data.id), // Patreon's user ID
        avatar: conditional(attributes.image_url),
        email: conditional(attributes.email),
        name: conditional(attributes.full_name),
        rawData: jsonGuard.parse({
          userInfo,
        }),
        email_verified: conditional(attributes.is_email_verified), // Direct email verification info
        profile: attributes.url,
        preferred_username: attributes.vanity,
        website: attributes.url,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { status, body: rawBody } = error.response;

        if (status === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

/**
 * Creates a Patreon connector.
 *
 * @param {Object} options - Options for creating the connector.
 * @param {Function} options.getConfig - Function used to get configuration options.
 * @returns {Object} - Patreon connector object.
 */
const createPatreonConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: patreonConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createPatreonConnector;
