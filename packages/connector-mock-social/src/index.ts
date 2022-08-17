import { randomUUID } from 'crypto';

import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  SocialConnector,
  ValidateConfig,
} from '@logto/connector-schemas';
import { z } from 'zod';

import { defaultMetadata } from './constant';
import { mockSocialConfigGuard, MockSocialConfig } from './types';

export default class MockSocialConnector extends SocialConnector<MockSocialConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<MockSocialConfig> = (config: unknown) => {
    const result = mockSocialConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    return `http://mock.social.com/?state=${state}&redirect_uri=${redirectUri}`;
  };

  public getAccessToken = async () => randomUUID();

  public getUserInfo: GetUserInfo = async (data) => {
    const dataGuard = z.object({ code: z.string(), userId: z.optional(z.string()) });
    const result = dataGuard.safeParse(data);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data));
    }

    // For mock use only. Use to track the created user entity
    return {
      id: result.data.userId ?? `mock-social-sub-${randomUUID()}`,
    };
  };
}
