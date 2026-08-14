// https://github.com/logto-io/node-oidc-provider/blob/513c523c0e68ee6112da8c871cce86204a136163/lib/shared/check_rar.js
declare module 'oidc-provider/lib/shared/check_rar.js' {
  import type { KoaContextWithOIDC } from 'oidc-provider';

  /**
   * Validates the `authorization_details` parameter (RFC 9396). A no-op pass-through to `next`
   * when the parameter is absent or the `richAuthorizationRequests` feature is disabled.
   */
  export default function checkRar(ctx: KoaContextWithOIDC, next: () => unknown): Promise<unknown>;
}
