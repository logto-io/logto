import { type KoaContextWithOIDC } from 'oidc-provider';

type Grant = InstanceType<KoaContextWithOIDC['oidc']['provider']['Grant']>;
type Client = NonNullable<KoaContextWithOIDC['oidc']['client']>;

/**
 * The OP scopes an existing Grant would serve for this request that the client is no longer
 * configured for. Resource and organization scope names never appear in `client.scope`, and a
 * first-party client carries no `scope` metadata at all; neither is narrowed.
 *
 * The consent-submission counterpart is `findStaleOidcScopes` in the consent route utils, which
 * runs before a Grant exists and classifies OP scopes by allowlist instead.
 */
export const getOidcScopesNoLongerAllowed = (
  grant: Grant | undefined,
  client: Client | undefined,
  requestedScopes: Set<string>
): string[] => {
  const clientScopes = new Set(client?.scope?.split(' ').filter(Boolean));

  if (!grant || clientScopes.size === 0) {
    return [];
  }

  return grant
    .getOIDCScopeFiltered(requestedScopes)
    .split(' ')
    .filter(Boolean)
    .filter((scope) => !clientScopes.has(scope));
};
