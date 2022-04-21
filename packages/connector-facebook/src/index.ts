/**
 * Reference: Manually Build a Login Flow
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
  SocialConnector,
  GetConnectorConfig,
  GetTimeout,
} from '@logto/connector-types';
import { ConnectorType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import { accessTokenEndpoint, authorizationEndpoint, scope, userInfoEndpoint } from './constant';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, 'README.md');
const pathToConfigTemplate = path.join(currentPath, 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

const facebookConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type FacebookConfig = z.infer<typeof facebookConfigGuard>;

export class FacebookConnector implements SocialConnector {
  public metadata: ConnectorMetadata = {
    id: 'facebook',
    type: ConnectorType.Social,
    name: {
      en: 'Sign In with Facebook',
      'zh-CN': 'Facebook 登录',
    },
    // TODO: add the real logo URL (LOG-1823)
    logo: './logo.png',
    description: {
      en: 'Sign In with Facebook',
      'zh-CN': 'Facebook 登录',
    },
    readme: existsSync(pathToReadmeFile)
      ? readFileSync(pathToReadmeFile, 'utf8')
      : readmeContentFallback,
    configTemplate: existsSync(pathToConfigTemplate)
      ? readFileSync(pathToConfigTemplate, 'utf-8')
      : configTemplateFallback,
  };

  public readonly getConfig: GetConnectorConfig<FacebookConfig>;
  public readonly getRequestTimeout: GetTimeout;

  constructor(
    getConnectorConfig: GetConnectorConfig<FacebookConfig>,
    getConnectorRequestTimeout: GetTimeout
  ) {
    this.getConfig = getConnectorConfig;
    this.getRequestTimeout = getConnectorRequestTimeout;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = facebookConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const config = await this.getConfig(this.metadata.id);

    return `${authorizationEndpoint}?${stringify({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope, // Only support fixed scope for v1.
    })}`;
  };

  public getAccessToken: GetAccessToken = async (code, redirectUri) => {
    type AccessTokenResponse = {
      access_token: string;
      token_type: string;
      expires_in: number;
    };

    const { clientId: client_id, clientSecret: client_secret } = await this.getConfig(
      this.metadata.id
    );

    const { access_token: accessToken } = await got
      .get(accessTokenEndpoint, {
        searchParams: {
          code,
          client_id,
          client_secret,
          redirect_uri: redirectUri,
        },
        timeout: await this.getRequestTimeout(),
      })
      .json<AccessTokenResponse>();

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    type UserInfoResponse = {
      id: string;
      email?: string;
      name?: string;
      picture?: { data: { url: string } };
    };

    const { accessToken } = accessTokenObject;

    try {
      const { id, email, name, picture } = await got
        .get(userInfoEndpoint, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          searchParams: {
            fields: 'id,name,email,picture',
          },
          timeout: await this.getRequestTimeout(),
        })
        .json<UserInfoResponse>();

      return {
        id,
        avatar: picture?.data.url,
        email,
        name,
      };
    } catch (error: unknown) {
      if (error instanceof GotRequestError && error.response?.statusCode === 400) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }
      throw error;
    }
  };
}
