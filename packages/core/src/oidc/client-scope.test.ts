import { ReservedScope, UserScope } from '@logto/core-kit';
import { type KoaContextWithOIDC } from 'oidc-provider';

import { getOidcScopesNoLongerAllowed } from './client-scope.js';

type Grant = InstanceType<KoaContextWithOIDC['oidc']['provider']['Grant']>;
type Client = NonNullable<KoaContextWithOIDC['oidc']['client']>;

/** Mirrors the real `getOIDCScopeFiltered`: the granted OP scopes intersected with the request. */
const asGrant = (grantedOidcScope: string) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal grant stub scoped to the method the helper reads
  ({
    getOIDCScopeFiltered: (filter: Set<string>) =>
      grantedOidcScope
        .split(' ')
        .filter((scope) => filter.has(scope))
        .join(' '),
  }) as Grant;

const asClient = (scope?: string) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub scoped to the field the helper reads
  ({ clientId: 'client_id', scope }) as Client;

const thirdPartyClient = asClient(
  [ReservedScope.OpenId, ReservedScope.OfflineAccess, UserScope.Profile].join(' ')
);

describe('getOidcScopesNoLongerAllowed', () => {
  it('reports a granted user scope the client is no longer configured for', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        asGrant([ReservedScope.OpenId, UserScope.Profile, UserScope.Email].join(' ')),
        thirdPartyClient,
        new Set([ReservedScope.OpenId, UserScope.Profile, UserScope.Email])
      )
    ).toEqual([UserScope.Email]);
  });

  it('reports nothing when every granted scope is still allowed', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        asGrant([ReservedScope.OpenId, UserScope.Profile].join(' ')),
        thirdPartyClient,
        new Set([ReservedScope.OpenId, UserScope.Profile])
      )
    ).toEqual([]);
  });

  it('ignores a no-longer-allowed scope the request does not ask for', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        asGrant([ReservedScope.OpenId, UserScope.Email].join(' ')),
        thirdPartyClient,
        new Set([ReservedScope.OpenId])
      )
    ).toEqual([]);
  });

  it('leaves resource and organization scope names alone', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        asGrant(ReservedScope.OpenId),
        thirdPartyClient,
        new Set([ReservedScope.OpenId, 'read:api', 'write:api'])
      )
    ).toEqual([]);
  });

  it('reports nothing for a client that carries no scope metadata', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        asGrant([ReservedScope.OpenId, UserScope.Email].join(' ')),
        asClient(),
        new Set([ReservedScope.OpenId, UserScope.Email])
      )
    ).toEqual([]);
  });

  it('reports nothing when the request resolved no grant', () => {
    expect(
      getOidcScopesNoLongerAllowed(
        undefined,
        thirdPartyClient,
        new Set([ReservedScope.OpenId, UserScope.Email])
      )
    ).toEqual([]);
  });
});
