import { validateConfig } from '@logto/connector-core';

import { ContextType, SendGridMailConfig, sendGridMailConfigGuard } from './types';

function validator(config: unknown): asserts config is SendGridMailConfig {
  validateConfig<SendGridMailConfig>(config, sendGridMailConfigGuard);
}

jest.mock('got');

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
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
    expect(() => {
      validator({});
    }).toThrow();
  });
});
