import { GetConnectorConfig, GetTimeout } from '@logto/connector-types';

import { WeChatNativeConnector, WeChatConfig } from '.';
import { authorizationEndpoint } from './constant';

const mockedConfig = {
  appId: '<app-id>',
  appSecret: '<app-secret>',
};

const getConnectorConfig = jest.fn() as GetConnectorConfig<WeChatConfig>;
const getConnectorRequestTimeout = jest.fn() as GetTimeout;

const WeChatNativeMethods = new WeChatNativeConnector(
  getConnectorConfig,
  getConnectorRequestTimeout
);

beforeAll(() => {
  jest.spyOn(WeChatNativeMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await WeChatNativeMethods.getAuthorizationUri(
      'http://localhost:3001/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?appid=%3Capp-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&scope=snsapi_userinfo&state=some_state`
    );
  });
});
