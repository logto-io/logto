import type { CustomClientMetadata } from '@logto/schemas';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {}

  export interface Configuration {
    allowWildcardRedirectUris?: boolean;
  }
}
