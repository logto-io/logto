// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/resolve_resource.js
declare module 'oidc-provider/lib/helpers/resolve_resource.js' {
  import { type Optional } from '@silverhand/essentials';
  import { type KoaContextWithOIDC } from 'oidc-provider';

  export default function resolveResource(
    ctx: KoaContextWithOIDC,
    model: unknown,
    config: unknown,
    scopes?: Set<string>
  ): Promise<Optional<string>>;
}
