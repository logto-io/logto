import { type IRouterParamContext } from 'koa-router';

type Auth = {
  type: 'user' | 'app';
  id: string;
  scopes: Set<string>;
  /** If the request is verified by a verification record, this will be set to `true`. */
  identityVerified?: boolean;
  /** Client ID of the OIDC access token */
  clientId?: string;
  /**
   * OIDC session uid that backs the current access token, when the token was minted from an
   * interactive (session-backed) flow. Absent for client-credentials tokens.
   */
  sessionUid?: string;
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
