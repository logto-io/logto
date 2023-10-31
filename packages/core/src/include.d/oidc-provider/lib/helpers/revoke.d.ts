declare module 'oidc-provider/lib/helpers/revoke.js' {
  import type { KoaContextWithOIDC } from 'oidc-provider';

  export default function revoke(ctx: KoaContextWithOIDC, grantId: string): Promise<void>;
}
