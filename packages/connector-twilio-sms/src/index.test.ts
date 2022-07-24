import { GetConnectorConfig } from '@logto/connector-types';

import TwilioSmsConnector from '.';
import { mockedConfig } from './mock';

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
    const validator: typeof twilioSmsMethods.validateConfig = twilioSmsMethods.validateConfig;
    expect(() => {
      validator(mockedConfig);
    }).not.toThrow();
  });

  it('throws if config is invalid', async () => {
    const validator: typeof twilioSmsMethods.validateConfig = twilioSmsMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });
});
