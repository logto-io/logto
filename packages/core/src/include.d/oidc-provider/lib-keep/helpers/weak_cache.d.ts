declare module 'oidc-provider/lib/helpers/weak_cache.js' {
  import type Provider, { type Configuration } from 'oidc-provider';

  /** Deeply make all properties of a record required. */
  type DeepRequired<T> = T extends Record<string | number | symbol, unknown>
    ? {
        [P in keyof T]-?: DeepRequired<T[P]>;
      }
    : T;

  type RequiredConfiguration = {
    [K in keyof Configuration]-?: DeepRequired<Configuration[K]>;
  };

  export default function instance(ctx: Provider): {
    configuration: () => RequiredConfiguration;
  };
}
