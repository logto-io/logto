import type { CustomClientMetadata } from '@logto/schemas';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {
    appLevelAccessControlEnabled?: boolean;
  }

  export interface Configuration {
    /** Byte limits per fetch purpose. Not declared by `@types/oidc-provider` 9.5.0. */
    fetchResponseBodyLimits?: Partial<
      Record<'client_id metadata document' | 'jwks_uri' | 'sector_identifier_uri', number>
    >;
  }
}
