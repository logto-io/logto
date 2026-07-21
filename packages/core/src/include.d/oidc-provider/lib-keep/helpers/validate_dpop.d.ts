// https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/helpers/validate_dpop.js
declare module 'oidc-provider/lib/helpers/validate_dpop.js' {
  import { type Optional } from '@silverhand/essentials';
  import type { KoaContextWithOIDC } from 'oidc-provider';

  export const CHALLENGE_OK_WINDOW: number;

  export default function dpopValidate(
    ctx: KoaContextWithOIDC,
    accessToken?: string
  ): Promise<Optional<{ thumbprint: string; jti: string; iat: number }>>;
}
