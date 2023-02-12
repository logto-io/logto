import { deduplicate, getEnv, trySafe } from '@silverhand/essentials';

import { isTrue } from './parameters.js';

export default class UrlSet {
  readonly #port = Number(getEnv(this.envPrefix + 'PORT') || this.defaultPort);
  readonly #endpoint = getEnv(this.envPrefix + 'ENDPOINT');

  public readonly isLocalhostDisabled = isTrue(getEnv(this.envPrefix + 'DISABLE_LOCALHOST'));

  constructor(
    public readonly isHttpsEnabled: boolean,
    protected readonly defaultPort: number,
    protected readonly envPrefix: string = ''
  ) {}

  public deduplicated(): URL[] {
    return deduplicate(
      [trySafe(() => this.localhostUrl.toString()), trySafe(() => this.endpoint.toString())].filter(
        (value): value is string => typeof value === 'string'
      )
    ).map((value) => new URL(value));
  }

  public get port(): number {
    if (this.isLocalhostDisabled) {
      throw new Error('Localhost has been disabled in this URL Set.');
    }

    return this.#port;
  }

  public get localhostUrl(): URL {
    return new URL(`${this.isHttpsEnabled ? 'https' : 'http'}://localhost:${this.port}`);
  }

  public get endpoint(): URL {
    if (!this.#endpoint) {
      if (this.isLocalhostDisabled) {
        throw new Error('No available endpoint in this URL Set.');
      }

      return this.localhostUrl;
    }

    return new URL(this.#endpoint);
  }
}
