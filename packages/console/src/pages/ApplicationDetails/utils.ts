import { type ApplicationResponse } from '@logto/schemas';

export type ApplicationForm = Pick<
  ApplicationResponse,
  'name' | 'description' | 'oidcClientMetadata' | 'customClientMetadata' | 'isAdmin'
>;

export const applicationFormDataParser = {
  fromResponse: (data: ApplicationResponse): ApplicationForm => {
    const { name, description, oidcClientMetadata, customClientMetadata, isAdmin } = data;

    return {
      name,
      description,
      oidcClientMetadata,
      customClientMetadata,
      isAdmin,
    };
  },
};
