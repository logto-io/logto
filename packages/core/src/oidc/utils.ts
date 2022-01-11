import { ApplicationType, OidcClientMetadata } from '@logto/schemas';

export const getApplicationTypeString = (type: ApplicationType) =>
  type === ApplicationType.Native ? 'native' : 'web';

export const buildOidcClientMetadata = (metadata?: OidcClientMetadata): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
  ...metadata,
});
