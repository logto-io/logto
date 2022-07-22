import BaseClient, { createRequester, LogtoConfig } from '@logto/client';

import { DummyStorage } from './dummy-storage';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators';

export default class LogtoClient extends BaseClient {
  public navigateUrl = '';

  constructor(config: LogtoConfig) {
    const requester = createRequester(fetch);
    super(
      // Note: Disable persisting access token in integration tests
      { ...config, persistAccessToken: false },
      {
        requester,
        navigate: (url: string) => {
          this.navigateUrl = url;
        },
        storage: new DummyStorage(),
        generateCodeChallenge,
        generateCodeVerifier,
        generateState,
      }
    );
  }
}
