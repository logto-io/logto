import { type IRouterParamContext } from 'koa-router';

type Auth = {
  type: 'user' | 'app';
  id: string;
  scopes: Set<string>;
  /**
   * Whether the request carries recent user authentication: either a valid `logto-verification-id`
   * verification record, or an OIDC authentication context on the access token that satisfies the
   * Account API policy. Read it through `assertIdentityVerified` on sensitive routes.
   */
  identityVerified?: boolean;
  /** Client ID of the OIDC access token */
  clientId?: string;
  /**
   * OIDC session uid that backs the current access token, when the token was minted from an
   * interactive (session-backed) flow. Absent for client-credentials tokens.
   */
  sessionUid?: string;
  /**
   * Whether the access token was issued to a first-party application, set with
   * {@link Auth.identityVerified} by `koaOidcAuth`; `undefined` when it did not evaluate the OIDC
   * authentication context (OIDC step-up authentication is off). A third-party caller never gains
   * identity verification from its token, and cannot act on an authentication challenge either.
   */
  isFirstPartyClient?: boolean;
  /**
   * The tenant's authentication freshness window, in seconds, resolved by `koaOidcAuth` when it
   * evaluated the OIDC authentication context for a first-party caller. The RFC 9470 challenge
   * advertises it as `max_age`, so the client and the policy that rejected the request agree.
   */
  maximumAuthenticationAgeInSeconds?: number;
  /** Set by `koaReadOnlyAccess` for a read-only Management API request. */
  isReadOnly?: boolean;
};

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    auth: Auth;
  };

export type TokenInfo = {
  sub: string;
  clientId: unknown;
  scopes: string[];
};
