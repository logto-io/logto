import { OidcClientMetadata } from '@logto/schemas';

export const generateOidcClientMetadata = (): OidcClientMetadata => ({
  redirect_uris: [],
  post_logout_redirect_uris: [],
});
