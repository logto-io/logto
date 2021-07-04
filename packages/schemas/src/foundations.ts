export type OidcModelInstancePayload = {
  [key: string]: unknown;
  userCode?: string;
  uid?: string;
  grantId?: string;
};

export type OidcClientMetadata = {
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
};
