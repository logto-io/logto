import type { CustomClientMetadata } from '@logto/schemas';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {
    appLevelAccessControlEnabled?: boolean;
  }

  export interface Client {
    /**
     * The fork's CIMD resolver stamps this marker onto every client it builds from a metadata
     * document; registered clients never carry it. Not covered by `@types/oidc-provider`.
     */
    readonly clientIdMetadataDocument?: true;
  }
}
