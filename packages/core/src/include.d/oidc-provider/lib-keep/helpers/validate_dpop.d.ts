// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/validate_dpop.js
declare module 'oidc-provider/lib/helpers/validate_dpop.js' {
  import { type Optional } from '@silverhand/essentials';
  import type { KoaContextWithOIDC } from 'oidc-provider';

  export default function dpopValidate(
    ctx: KoaContextWithOIDC
  ): Promise<Optional<{ thumbprint: string; jti?: string; iat?: string }>>;
}
