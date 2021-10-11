import { ApplicationType, OidcClientMetadata } from '@logto/schemas';

const getApplicationTypeString = (type: ApplicationType) =>
  type === ApplicationType.Native ? 'native' : 'web';

export const buildOidcClientMetadata = (
  type: ApplicationType,
  metadata?: OidcClientMetadata
): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
  ...metadata,
  applicationType: getApplicationTypeString(type),
});
