import { customClientMetadataDefault, type ApplicationResponse } from '@logto/schemas';
import { type DeepPartial, cond } from '@silverhand/essentials';

type ProtectedAppMetadataType = ApplicationResponse['protectedAppMetadata'];

export type ApplicationForm = {
  name: ApplicationResponse['name'];
  description?: ApplicationResponse['description'];
  oidcClientMetadata?: ApplicationResponse['oidcClientMetadata'];
  customClientMetadata?: ApplicationResponse['customClientMetadata'];
  isAdmin?: ApplicationResponse['isAdmin'];
  // eslint-disable-next-line @typescript-eslint/ban-types
  protectedAppMetadata?: Omit<Exclude<ProtectedAppMetadataType, null>, 'customDomains'>; // Custom domains are handled separately
};

const mapToUriFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri));

const mapToUriOriginFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri.replace(/\/*$/, '')));

export const applicationFormDataParser = {
  fromResponse: (data: ApplicationResponse): ApplicationForm => {
    const {
      name,
      description,
      oidcClientMetadata,
      customClientMetadata,
      isAdmin,
      /** Specific metadata for protected apps */
      protectedAppMetadata,
    } = data;

    return {
      name,
      ...cond(
        !protectedAppMetadata && {
          description,
          oidcClientMetadata,
          customClientMetadata: {
            ...customClientMetadataDefault,
            ...customClientMetadata,
          },
          isAdmin,
        }
      ),
      ...cond(
        protectedAppMetadata && {
          protectedAppMetadata: {
            ...protectedAppMetadata,
            sessionDuration: protectedAppMetadata.sessionDuration / 3600 / 24,
          },
        }
      ),
    };
  },
  toRequestPayload: (data: ApplicationForm): DeepPartial<ApplicationResponse> => {
    const {
      name,
      description,
      oidcClientMetadata,
      customClientMetadata,
      isAdmin,
      protectedAppMetadata,
    } = data;

    return {
      name,
      ...cond(
        !protectedAppMetadata && {
          description,
          oidcClientMetadata: {
            ...oidcClientMetadata,
            redirectUris: mapToUriFormatArrays(oidcClientMetadata?.redirectUris),
            postLogoutRedirectUris: mapToUriFormatArrays(
              oidcClientMetadata?.postLogoutRedirectUris
            ),
            // Empty string is not a valid URL
            backchannelLogoutUri: cond(oidcClientMetadata?.backchannelLogoutUri),
          },
          customClientMetadata: {
            ...customClientMetadata,
            corsAllowedOrigins: mapToUriOriginFormatArrays(
              customClientMetadata?.corsAllowedOrigins
            ),
          },
          isAdmin,
        }
      ),
      ...cond(
        protectedAppMetadata && {
          protectedAppMetadata: {
            ...protectedAppMetadata,
            sessionDuration: protectedAppMetadata.sessionDuration * 3600 * 24,
          },
        }
      ),
    };
  },
};
