// https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/shared/check_rar.js
declare module 'oidc-provider/lib/shared/check_rar.js' {
  import type { KoaContextWithOIDC } from 'oidc-provider';

  /**
   * Validates the `authorization_details` parameter (RFC 9396). A no-op pass-through to `next`
   * when the parameter is absent or the `richAuthorizationRequests` feature is disabled.
   */
  export default function checkRar(ctx: KoaContextWithOIDC, next: () => unknown): Promise<unknown>;
}
