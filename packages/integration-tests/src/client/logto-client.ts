import BaseClient, { LogtoConfig } from '@logto/node';

import { MemoryStorage } from './storage';

export default class LogtoClient extends BaseClient {
  public navigateUrl = '';

  constructor(config: LogtoConfig) {
    super(
      // Note: Disable persisting access token in integration tests
      { ...config, persistAccessToken: false },
      {
        navigate: (url: string) => {
          this.navigateUrl = url;
        },
        storage: new MemoryStorage(),
      }
    );
  }
}
