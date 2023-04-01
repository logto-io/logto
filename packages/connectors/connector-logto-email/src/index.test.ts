import nock from 'nock';

import { VerificationCodeType } from '@logto/connector-kit';

import { emailEndpoint } from './constant.js';
import { mockedAccessTokenResponse, mockedConfig } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  beforeAll(() => {
    nock(mockedConfig.tokenEndpoint).post('').reply(200, JSON.stringify(mockedAccessTokenResponse));
  });

  it('should send message successfully', async () => {
    nock(mockedConfig.endpoint).post(emailEndpoint).reply(200);
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: 'wangsijie94@gmail.com',
        type: VerificationCodeType.SignIn,
        payload: { code: '1234' },
      })
    ).resolves.not.toThrow();
  });
});
