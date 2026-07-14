/**
 * @file The single module allowed to deep-import `oidc-provider` internals. All other modules
 * must import them from here, so upgrading the `oidc-provider` fork only requires changes in
 * this file.
 */
import type { KoaContextWithOIDC, Provider } from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

export { default as difference } from 'oidc-provider/lib/helpers/_/difference.js';
export { default as certificateThumbprint } from 'oidc-provider/lib/helpers/certificate_thumbprint.js';
export { default as epochTime } from 'oidc-provider/lib/helpers/epoch_time.js';
export { default as filterClaims } from 'oidc-provider/lib/helpers/filter_claims.js';
export { default as resolveResource } from 'oidc-provider/lib/helpers/resolve_resource.js';
export { default as revoke } from 'oidc-provider/lib/helpers/revoke.js';
export { default as dpopValidate } from 'oidc-provider/lib/helpers/validate_dpop.js';
export { default as validatePresence } from 'oidc-provider/lib/helpers/validate_presence.js';
export { default as checkResource } from 'oidc-provider/lib/shared/check_resource.js';

/**
 * Since v9, custom grant handlers are the final token-endpoint middleware and receive no `next`
 * callback. `@types/oidc-provider` still describes the pre-v9 two-parameter signature.
 */
export type GrantTypeHandler = (ctx: KoaContextWithOIDC) => Promise<void>;

export const getProviderConfiguration = (provider: Provider) => instance(provider).configuration;
