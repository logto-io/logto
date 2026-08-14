import { type KoaContextWithOIDC } from 'oidc-provider';

type Grant = InstanceType<KoaContextWithOIDC['oidc']['provider']['Grant']>;
type Client = NonNullable<KoaContextWithOIDC['oidc']['client']>;

/**
 * The OP scopes an existing Grant would serve for this request that the client is no longer
 * configured for. Resource and organization scope names never appear in `client.scope`, and a
 * first-party client carries no `scope` metadata at all — neither is narrowed.
 */
export const getOidcScopesNoLongerAllowed = (
  grant: Grant | undefined,
  client: Client | undefined,
  requestedScopes: Set<string>
): string[] => {
  const clientScopes = client?.scope?.split(' ');

  if (!grant || !clientScopes) {
    return [];
  }

  return grant
    .getOIDCScopeFiltered(requestedScopes)
    .split(' ')
    .filter(Boolean)
    .filter((scope) => !clientScopes.includes(scope));
};
