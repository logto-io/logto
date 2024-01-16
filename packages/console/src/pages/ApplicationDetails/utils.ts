import {
  customClientMetadataDefault,
  type ApplicationResponse,
  type Application,
} from '@logto/schemas';

export type ApplicationForm = Pick<
  ApplicationResponse,
  'name' | 'description' | 'oidcClientMetadata' | 'customClientMetadata' | 'isAdmin'
>;

const mapToUriFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri)) ?? [];

const mapToUriOriginFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(uri.replace(/\/*$/, ''))) ?? [];

export const applicationFormDataParser = {
  fromResponse: (data: ApplicationResponse): ApplicationForm => {
    const { name, description, oidcClientMetadata, customClientMetadata, isAdmin } = data;

    return {
      name,
      description,
      oidcClientMetadata,
      customClientMetadata: {
        ...customClientMetadataDefault,
        ...customClientMetadata,
      },
      isAdmin,
    };
  },
  toUpdateApplicationData: (formData: ApplicationForm): Partial<Application> => {
    return {
      ...formData,
      oidcClientMetadata: {
        ...formData.oidcClientMetadata,
        redirectUris: mapToUriFormatArrays(formData.oidcClientMetadata.redirectUris),
        postLogoutRedirectUris: mapToUriFormatArrays(
          formData.oidcClientMetadata.postLogoutRedirectUris
        ),
      },
      customClientMetadata: {
        ...formData.customClientMetadata,
        corsAllowedOrigins: mapToUriOriginFormatArrays(
          formData.customClientMetadata.corsAllowedOrigins
        ),
      },
    };
  },
};
