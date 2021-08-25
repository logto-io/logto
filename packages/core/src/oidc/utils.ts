import { OidcClientMetadata } from '@logto/schemas';

export const generateOidcClientMetadata = (): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
});
