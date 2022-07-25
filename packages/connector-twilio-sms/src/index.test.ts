import { GetConnectorConfig, ValidateConfig } from '@logto/connector-types';

import TwilioSmsConnector from '.';
import { mockedConfig } from './mock';
import { TwilioSmsConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const twilioSmsMethods = new TwilioSmsConnector(getConnectorConfig);

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: ValidateConfig<TwilioSmsConfig> = twilioSmsMethods.validateConfig;
    expect(() => {
      validator(mockedConfig);
    }).not.toThrow();
  });

  it('throws if config is invalid', async () => {
    const validator: ValidateConfig<TwilioSmsConfig> = twilioSmsMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });
});
