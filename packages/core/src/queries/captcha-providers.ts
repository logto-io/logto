import {
  CaptchaType,
  type CaptchaProvider,
  CaptchaProviders,
  type CaptchaProviderKeys,
  type CreateCaptchaProvider,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '../caches/well-known.js';
import SchemaQueries from '../utils/SchemaQueries.js';

export class CaptchaProviderQueries extends SchemaQueries<
  CaptchaProviderKeys,
  CreateCaptchaProvider,
  CaptchaProvider
> {
  /**
   * The Cap Standalone endpoint of the current captcha provider, or `null` if the provider is not
   * Cap. It is public data (the experience app needs it to reach the instance), so it's safe to
   * cache and is used to build the experience CSP on every page request.
   */
  public readonly findCapEndpoint = this.wellKnownCache.memoize(
    // eslint-disable-next-line unicorn/consistent-function-scoping -- False positive, `this` is used
    async () => {
      const provider = await this.findCaptchaProvider();
      return provider?.config.type === CaptchaType.Cap ? provider.config.endpoint : null;
    },
    ['captcha-cap-endpoint']
  );

  public readonly upsertCaptchaProvider = this.wellKnownCache.mutate(
    // eslint-disable-next-line unicorn/consistent-function-scoping -- False positive, `this` is used
    async (captchaProvider: Pick<CaptchaProvider, 'config'>): Promise<CaptchaProvider> => {
      const existing = await this.findCaptchaProvider();

      if (existing) {
        return this.updateById(existing.id, captchaProvider, 'replace');
      }

      return this.insert({
        ...captchaProvider,
        id: generateStandardId(),
      });
    },
    ['captcha-cap-endpoint']
  );

  public readonly deleteCaptchaProvider = this.wellKnownCache.mutate(
    // eslint-disable-next-line unicorn/consistent-function-scoping -- False positive, `this` is used
    async (): Promise<void> => {
      const existing = await this.findCaptchaProvider();

      if (existing) {
        await this.deleteById(existing.id);
      }
    },
    ['captcha-cap-endpoint']
  );

  constructor(
    public readonly pool: CommonQueryMethods,
    private readonly wellKnownCache: WellKnownCache
  ) {
    super(pool, CaptchaProviders);
  }

  public readonly findCaptchaProvider = async (): Promise<CaptchaProvider | undefined> => {
    const [, providers] = await this.findAll();

    if (providers.length === 0) {
      return;
    }

    if (providers.length > 1) {
      // Not expected to happen
      throw new Error('Multiple captcha providers are not allowed.');
    }

    return providers[0];
  };
}
