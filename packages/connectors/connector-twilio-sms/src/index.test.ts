import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('Twilio SMS connector', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should send `To` number in E.164 format', async () => {
    const url = new URL(
      'https://api.twilio.com/2010-04-01/Accounts/account-sid/Messages.json'
    );
    const mockedPost = nock(url.origin)
      .post(url.pathname, (body) => {
        expect(body).toMatchObject({ To: '+4512345678' });
        return true;
      })
      .reply(200, { sid: 'SMxxxx' });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage(
      {
        to: '4512345678',
        type: TemplateType.Generic,
        payload: { code: '123456' },
      },
      {
        ...mockedConfig,
        templates: [
          { usageType: 'Register', content: 'code {{code}}' },
          { usageType: 'SignIn', content: 'code {{code}}' },
          { usageType: 'ForgotPassword', content: 'code {{code}}' },
          { usageType: 'Generic', content: 'code {{code}}' },
        ],
      }
    );

    expect(mockedPost.isDone()).toBe(true);
  });
});
