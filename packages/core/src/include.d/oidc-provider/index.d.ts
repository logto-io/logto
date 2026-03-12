import type { CustomClientMetadata } from '@logto/schemas';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {}

  export interface Configuration {
    allowWildcardRedirectUris?: boolean;
  }

  /**
   * `oidc-provider` exposes these route helpers at runtime, but `@types/oidc-provider` does not
   * currently declare them. Device flow and several other source callbacks rely on the helpers to
   * rebuild provider-owned URLs without hardcoding route paths or issuer details in our app code.
   */
  export interface OIDCContext {
    urlFor?(name: string, opt?: Record<string, unknown>): string;
  }
}
