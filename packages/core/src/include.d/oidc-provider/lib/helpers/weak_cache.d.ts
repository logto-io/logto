declare module 'oidc-provider/lib/helpers/weak_cache.js' {
  import type Provider, { KoaContextWithOIDC, type Configuration } from 'oidc-provider';

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
    /**
     * The dynamic format resolvers that are used to choose the format (opaque or jwt) of the tokens.
     *
     * @see {@link https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/models/mixins/has_format.js#L37-L40 | `has_format()` in oidc-provider}
     */
    dynamic: Record<string, (ctx: KoaContextWithOIDC, token: Provider['BaseToken']) => string>;
  };
}
