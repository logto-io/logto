export type OidcClientMetadataKey = 'redirectUris' | 'postLogoutRedirectUris';
export type CustomClientMetadataKey = 'corsAllowedOrigins';

export type Name = OidcClientMetadataKey | CustomClientMetadataKey;

export type GuideForm = Record<Name, string[]>;
