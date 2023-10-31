import type { CustomClientMetadata } from '@logto/schemas';
import Provider from 'oidc-provider';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {}

  // Have to do this to make TypeScript happy since `@types/` packages are default CJS
  export = Provider;
}
