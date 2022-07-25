import { GetConnectorConfig, ValidateConfig } from '@logto/connector-types';

import SendGridMailConnector from '.';
import { mockedConfig } from './mock';
import { ContextType, SendGridMailConfig } from './types';

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

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: ValidateConfig<SendGridMailConfig> = sendGridMailMethods.validateConfig;
    expect(() => {
      validator({
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
      });
    }).not.toThrow();
  });

  it('should be false if config is invalid', async () => {
    const validator: ValidateConfig<SendGridMailConfig> = sendGridMailMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });
});
