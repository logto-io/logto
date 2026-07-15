// https://github.com/logto-io/node-oidc-provider/blob/7722ac95d77cd62a41528aec4eb711b3d12589d4/lib/helpers/grant_common.js
declare module 'oidc-provider/lib/helpers/grant_common.js' {
  import { type X509Certificate } from 'node:crypto';

  import type { Account, FindAccount, KoaContextWithOIDC } from 'oidc-provider';

  type OidcProvider = KoaContextWithOIDC['oidc']['provider'];

  /**
   * The `AccessToken` instance returned by `createAccessToken`, widened with runtime members
   * missing from `@types/oidc-provider`: the `setThumbprint` mixin and the rich authorization
   * request data (`rar`, RFC 9396).
   */
  type WidenedAccessToken = InstanceType<OidcProvider['AccessToken']> & {
    rar?: unknown;
    setThumbprint(name: 'jkt' | 'x5t', input: string | X509Certificate): void;
  };

  /**
   * Returns the client certificate when the client requires mTLS-bound access tokens and throws
   * `InvalidGrant` when the certificate is missing; returns `undefined` for other clients.
   */
  export function checkMtlsCert(
    ctx: KoaContextWithOIDC,
    getCertificate: (ctx: KoaContextWithOIDC) => X509Certificate | string | undefined
  ): X509Certificate | string | undefined;

  /** Throws `InvalidGrant` when the client requires DPoP-bound access tokens but no proof is given. */
  export function checkDpopRequired(ctx: KoaContextWithOIDC, dPoP: unknown): void;

  /**
   * Finds the grant by id and throws `InvalidGrant` when it is missing, expired, or belongs to
   * another client.
   */
  export function validateGrant(
    ctx: KoaContextWithOIDC,
    grantId: string
  ): Promise<InstanceType<OidcProvider['Grant']>>;

  /**
   * Resolves the account of the source token via `findAccount` and throws `InvalidGrant`
   * (`` `${entityLabel} invalid (referenced account not found)` ``) when it cannot be found.
   * The runtime passes the whole source token as `findAccount`'s third argument.
   */
  export function validateAccount(
    ctx: KoaContextWithOIDC,
    findAccount: FindAccount,
    code: { accountId?: string },
    entityLabel: string
  ): Promise<Account>;

  /** Throws `InvalidGrant` when the source token and the grant reference different accounts. */
  export function checkAccountMismatch(
    code: { accountId?: string },
    grant: { accountId?: string }
  ): void;

  export function createAccessToken(
    ctx: KoaContextWithOIDC,
    AccessToken: OidcProvider['AccessToken'],
    source: {
      accountId: string;
      expiresWithSession?: boolean;
      grantId?: string;
      sessionUid?: string;
      sid?: string;
    },
    gty: string
  ): WidenedAccessToken;

  /** Sets the `x5t` thumbprint on the access token when a client certificate is present. */
  export function applyMtlsBinding(at: WidenedAccessToken, cert?: string | X509Certificate): void;

  /**
   * Binds the token to the DPoP proof key when a proof is present: runs replay detection
   * (unless `allowReplay` is enabled) and sets the `jkt` thumbprint.
   */
  export function applyDpopBinding(
    ctx: KoaContextWithOIDC,
    dPoP: { jti: string; thumbprint: string } | undefined,
    at: { setThumbprint(name: 'jkt', input: string): void },
    allowReplay: boolean
  ): Promise<void>;

  /**
   * Issues the ID token when the effective scope contains `openid`; returns `undefined`
   * otherwise. Since v9 the token-endpoint ID token no longer carries `at_hash`.
   */
  export function issueIdToken(
    ctx: KoaContextWithOIDC,
    source: InstanceType<OidcProvider['RefreshToken']>,
    at: WidenedAccessToken,
    grant: InstanceType<OidcProvider['Grant']>,
    options: { conformIdTokenClaims: boolean; userinfo: { enabled: boolean } },
    scopeOverride?: Set<string>
  ): Promise<string | undefined>;

  /**
   * Builds the token endpoint response body. The fork's scope-always-present patch makes `scope`
   * unconditionally echo the access token's scope; `source` is still accepted for upstream
   * call-site parity but no longer read.
   */
  export function buildTokenResponse(
    at: WidenedAccessToken,
    accessToken: string,
    extras: {
      idToken?: string;
      refreshToken?: string;
      source: { scope?: string };
      rar?: unknown;
    }
  ): {
    access_token: string;
    expires_in: number;
    id_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type: string;
    authorization_details?: unknown;
  };
}
