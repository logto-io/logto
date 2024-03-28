import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import { smsEndpoint } from './constant.js';
import { mockedAccessTokenResponse, mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  beforeAll(() => {
    nock(mockedConfig.tokenEndpoint).post('').reply(200, JSON.stringify(mockedAccessTokenResponse));
  });

  it('should send message successfully', async () => {
    nock(mockedConfig.endpoint).post(smsEndpoint).reply(200);
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: '13000000000',
        type: TemplateType.SignIn,
        payload: { code: '1234' },
      })
    ).resolves.not.toThrow();
  });
});
