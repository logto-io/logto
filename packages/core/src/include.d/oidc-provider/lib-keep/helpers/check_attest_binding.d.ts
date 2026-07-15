// https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/helpers/check_attest_binding.js
declare module 'oidc-provider/lib/helpers/check_attest_binding.js' {
  import type { KoaContextWithOIDC } from 'oidc-provider';

  /**
   * Verifies that the `oauth-client-attestation` header's public key matches the attestation
   * thumbprint stored on the source token; throws `InvalidGrant` on mismatch. Only meaningful
   * for clients using the `attest_jwt_client_auth` client authentication method.
   */
  export function checkAttestBinding(
    ctx: KoaContextWithOIDC,
    model: { attestationJkt?: string }
  ): Promise<void>;
}
