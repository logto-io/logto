// https://github.com/logto-io/node-oidc-provider/blob/513c523c0e68ee6112da8c871cce86204a136163/lib/helpers/validate_dpop.js
declare module 'oidc-provider/lib/helpers/validate_dpop.js' {
  import { type Optional } from '@silverhand/essentials';
  import type { KoaContextWithOIDC } from 'oidc-provider';

  /**
   * Rejects a replayed DPoP proof (`jti` seen before) with the given error class. A no-op when
   * no proof is present or `features.dPoP.allowReplay` is enabled.
   */
  export function checkDpopReplay(
    ctx: KoaContextWithOIDC,
    dPoP: { jti: string } | undefined,
    clientId: string,
    ErrorClass: new (description: string) => Error
  ): Promise<void>;

  export default function dpopValidate(
    ctx: KoaContextWithOIDC,
    accessToken?: string
  ): Promise<Optional<{ thumbprint: string; jti: string; iat: number }>>;
}
