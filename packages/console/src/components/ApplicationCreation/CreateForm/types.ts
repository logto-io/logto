import { type ApplicationType } from '@logto/schemas';

export type CreateApplicationFormData = {
  type: ApplicationType;
  name: string;
  description?: string;
  isThirdParty?: boolean;
  isDeviceFlow?: boolean;
};
