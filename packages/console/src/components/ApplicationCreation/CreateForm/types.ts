import { type ApplicationType } from '@logto/schemas';

export enum AuthorizationFlow {
  AuthorizationCode = 'authorization_code',
  DeviceFlow = 'device_flow',
}

export type CreateApplicationFormData = {
  type: ApplicationType;
  name: string;
  description?: string;
  isThirdParty?: boolean;
  authorizationFlow?: AuthorizationFlow;
};
