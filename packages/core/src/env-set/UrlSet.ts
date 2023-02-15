import { deduplicate, getEnv, trySafe } from '@silverhand/essentials';

import { isTrue } from './parameters.js';

const localhostDisabledMessage = 'Localhost has been disabled in this URL Set.';

export default class UrlSet {
  readonly #port = Number(getEnv(this.envPrefix + 'PORT') || this.defaultPort);
  readonly #endpoint = getEnv(this.envPrefix + 'ENDPOINT');

  public readonly isLocalhostDisabled = isTrue(getEnv(this.envPrefix + 'DISABLE_LOCALHOST'));

  constructor(
    public readonly isHttpsEnabled: boolean,
    protected readonly defaultPort: number,
    protected readonly envPrefix: string = ''
  ) {}

  public deduplicated(): string[] {
    return deduplicate(
      [trySafe(() => this.localhostUrl), trySafe(() => this.endpoint)].filter(
        (value): value is string => typeof value === 'string'
      )
    );
  }

  public get port() {
    if (this.isLocalhostDisabled) {
      throw new Error(localhostDisabledMessage);
    }

    return this.#port;
  }

  public get localhostUrl() {
    return `${this.isHttpsEnabled ? 'https' : 'http'}://localhost:${this.port}`;
  }

  public get endpoint() {
    return this.#endpoint || this.localhostUrl;
  }
}
