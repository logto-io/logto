import { ApplicationType } from '@logto/schemas';

import { getApplicationTypeString, buildOidcClientMetadata } from './utils';

describe('oidc utils method', () => {
  it('getApplicationTypeString', () => {
    expect(getApplicationTypeString(ApplicationType.SPA)).toEqual('web');
    expect(getApplicationTypeString(ApplicationType.Native)).toEqual('native');
    expect(getApplicationTypeString(ApplicationType.Traditional)).toEqual('web');
  });

  it('buildOidcClientMetadata', () => {
    const metadata = {
      redirectUris: ['logto.dev'],
      postLogoutRedirectUris: ['logto.dev'],
      logoUri: 'logto.pnf',
    };
    expect(buildOidcClientMetadata()).toEqual({ redirectUris: [], postLogoutRedirectUris: [] });
    expect(buildOidcClientMetadata(metadata)).toEqual(metadata);
  });
});
