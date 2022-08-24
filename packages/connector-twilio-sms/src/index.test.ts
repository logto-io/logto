import { validateConfig } from '@logto/connector-core';

import { mockedConfig } from './mock';
import { TwilioSmsConfig, twilioSmsConfigGuard } from './types';

function validator(config: unknown): asserts config is TwilioSmsConfig {
  validateConfig<TwilioSmsConfig>(config, twilioSmsConfigGuard);
}

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
      validator(mockedConfig);
    }).not.toThrow();
  });

  it('throws if config is invalid', async () => {
    expect(() => {
      validator({});
    }).toThrow();
  });
});
