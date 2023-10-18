const scopeOpenid = 'openid' as const;
const delimiter = /[ +]/;

/**
 * Scope config processor for OIDC connector. openid scope is required to retrieve id_token
 * @see https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * @param scope
 * @returns
 */
export const scopePostProcessor = (scope: string) => {
  const splitScopes = scope.split(delimiter).filter(Boolean);

  if (!splitScopes.includes(scopeOpenid)) {
    return [...splitScopes, scopeOpenid].join(' ');
  }

  return scope;
};
