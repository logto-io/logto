import { conditional } from '@silverhand/essentials';

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
  defaultMetadata,
  defaultTimeout,
  defaultScope,
  userInfoEndpoint,
} from './constant.js';
import type { XConfig } from './types.js';
import {
  xConfigGuard,
  userInfoResponseGuard,
  authResponseGuard,
  accessTokenResponseGuard,
} from './types.js';
import { generateCodeVerifier, generateCodeChallenge } from './utils.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, xConfigGuard);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    await setSession({ codeVerifier });

    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: scope ?? config.scope ?? defaultScope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${authorizationEndpoint}?${queryParams.toString()}`;
  };

export const getAccessToken = async (
  config: XConfig,
  code: string,
  codeVerifier: string,
  redirectUri: string
) => {
  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const response = await ky
    .post(accessTokenEndpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier,
      }).toString(),
      timeout: defaultTimeout,
    })
    .json();

  return accessTokenResponseGuard.parse(response);
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, xConfigGuard);

    const authResponseResult = authResponseGuard.safeParse(data);

    if (!authResponseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(data));
    }

    const { code, redirectUri } = authResponseResult.data;
    const { codeVerifier } = await getSession();

    if (!codeVerifier || typeof codeVerifier !== 'string') {
      throw new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `codeVerifier` from connector session.',
      });
    }

    try {
      const { access_token, token_type } = await getAccessToken(
        config,
        code,
        codeVerifier,
        redirectUri
      );

      const hasEmailScope = (config.scope ?? defaultScope).split(' ').includes('users.email');

      const userInfo = await ky
        .get(`${userInfoEndpoint}${hasEmailScope ? '?user.fields=confirmed_email' : ''}`, {
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
          timeout: defaultTimeout,
        })
        .json();
      const userInfoResult = userInfoResponseGuard.safeParse(userInfo);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userInfoResult.error);
      }

      const {
        data: { id, name, confirmed_email: email },
      } = userInfoResult.data;

      return {
        id,
        name: conditional(name),
        email: conditional(email),
        rawData: jsonGuard.parse(userInfo),
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

const createXConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: xConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createXConnector;
