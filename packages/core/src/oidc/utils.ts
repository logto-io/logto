import {
  ApplicationType,
  CustomClientMetadata,
  customClientMetadataGuard,
  CustomClientMetadataKey,
  OidcClientMetadata,
} from '@logto/schemas';
import { errors } from 'oidc-provider';

export const getApplicationTypeString = (type: ApplicationType) =>
  type === ApplicationType.Native ? 'native' : 'web';

export const buildOidcClientMetadata = (metadata?: OidcClientMetadata): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
  ...metadata,
});

const isOrigin = (value: string) => {
  try {
    const { origin } = new URL(value);

    // Origin: <scheme> "://" <hostname> [ ":" <port> ]
    return value === origin;
  } catch {
    return false;
  }
};

export const validateCustomClientMetadata = (key: string, value: unknown) => {
  const result = customClientMetadataGuard.pick({ [key]: true }).safeParse({ [key]: value });

  if (!result.success) {
    throw new errors.InvalidClientMetadata(key);
  }

  if (
    key === CustomClientMetadataKey.CorsAllowedOrigins &&
    Array.isArray(value) &&
    value.some((origin) => !isOrigin(origin))
  ) {
    throw new errors.InvalidClientMetadata(CustomClientMetadataKey.CorsAllowedOrigins);
  }
};

export const isOriginAllowed = (origin: string, customClientMetadata: CustomClientMetadata) =>
  Boolean(customClientMetadata.corsAllowedOrigins?.includes(origin));
