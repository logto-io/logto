import { GetConnectorConfig } from '@logto/connector-types';

import { SendGridMailConnector } from '.';
import { mockedApiKey, mockedConfig } from './mock';
import { ContextType, SendGridMailConfig } from './types';
import { request } from './utils';

const getConnectorConfig = jest.fn() as GetConnectorConfig<SendGridMailConfig>;

const sendGridMailMethods = new SendGridMailConnector(getConnectorConfig);

jest.mock('./utils');

beforeAll(() => {
  jest.spyOn(sendGridMailMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      sendGridMailMethods.validateConfig({
        apiKey: 'apiKey',
        fromEmail: 'noreply@logto.test.io',
        fromName: 'Logto Test',
        templates: [
          {
            usageType: 'Test',
            type: ContextType.TEXT,
            subject: 'Logto Test Template',
            content: 'This is for testing purposes only. Your passcode is {{code}}.',
          },
        ],
      })
    ).resolves.not.toThrow();
  });

  it('throws if config is invalid', async () => {
    await expect(sendGridMailMethods.validateConfig({})).rejects.toThrow();
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call request() and replace code in content', async () => {
    await sendGridMailMethods.sendMessage('to@email.com', 'Test', { code: '1234' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        personalizations: [{ to: { email: 'to@email.com' } }],
        from: { email: 'noreply@logto.test.io' },
        content: [
          {
            type: ContextType.TEXT,
            value: 'This is for testing purposes only. Your passcode is 1234.',
          },
        ],
        subject: 'Logto Test Template',
      }),
      mockedApiKey
    );
    // Expect(request).toHaveBeenCalled();
  });

  it('throws if template is missing', async () => {
    await expect(
      sendGridMailMethods.sendMessage('to@email.com', 'Register', { code: '1234' })
    ).rejects.toThrow();
  });
});
