import { GetConnectorConfig } from '@logto/connector-types';

import { SendGridMailConnector } from '.';
import { mockedConfig } from './mock';
import { ContextType, SendGridMailConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<SendGridMailConfig>;

const sendGridMailMethods = new SendGridMailConnector(getConnectorConfig);

jest.mock('got');

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
            type: ContextType.Text,
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
