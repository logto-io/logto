import { GetConnectorConfig } from '@logto/connector-types';

import SendGridMailConnector from '.';
import { mockedConfig } from './mock';
import { ContextType } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

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
    expect(
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
    ).toEqual(true);
  });

  it('should be false if config is invalid', async () => {
    expect(sendGridMailMethods.validateConfig({})).toEqual(false);
  });
});
