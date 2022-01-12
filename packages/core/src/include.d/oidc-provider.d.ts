import { CustomClientMetadata } from '@logto/schemas';
import { AllClientMetadata } from 'oidc-provider';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {}
}
