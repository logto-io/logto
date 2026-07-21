/**
 * @file The single module allowed to deep-import `oidc-provider` internals. All other modules
 * must import them from here, so upgrading the `oidc-provider` fork only requires changes in
 * this file.
 */
import type { KoaContextWithOIDC, Provider } from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

export { default as difference } from 'oidc-provider/lib/helpers/_/difference.js';
export { default as certificateThumbprint } from 'oidc-provider/lib/helpers/certificate_thumbprint.js';
export { checkAttestBinding } from 'oidc-provider/lib/helpers/check_attest_binding.js';
export { default as epochTime } from 'oidc-provider/lib/helpers/epoch_time.js';
export { pluralize } from 'oidc-provider/lib/helpers/formatters.js';
export {
  applyDpopBinding,
  applyMtlsBinding,
  buildTokenResponse,
  checkAccountMismatch,
  checkDpopRequired,
  checkMtlsCert,
  createAccessToken,
  issueIdToken,
  validateAccount,
  validateGrant,
} from 'oidc-provider/lib/helpers/grant_common.js';
export { default as resolveResource } from 'oidc-provider/lib/helpers/resolve_resource.js';
export { default as revoke } from 'oidc-provider/lib/helpers/revoke.js';
export {
  default as dpopValidate,
  CHALLENGE_OK_WINDOW,
} from 'oidc-provider/lib/helpers/validate_dpop.js';
export { default as validatePresence } from 'oidc-provider/lib/helpers/validate_presence.js';
export { default as checkRar } from 'oidc-provider/lib/shared/check_rar.js';
export { default as checkResource } from 'oidc-provider/lib/shared/check_resource.js';

/**
 * Since v9, custom grant handlers are the final token-endpoint middleware and receive no `next`
 * callback. `@types/oidc-provider` still describes the pre-v9 two-parameter signature.
 */
export type GrantTypeHandler = (ctx: KoaContextWithOIDC) => Promise<void>;

/**
 * The `ReplayDetection` model class with its static `unique` method. `@types/oidc-provider`
 * declares `unique` only as an instance method, but the runtime implements it as a static method
 * of the class. Do not declare the missing static via module augmentation: the typings export the
 * model classes with `export type` on purpose, and a value declaration would make
 * `import { ReplayDetection } from 'oidc-provider'` pass type checking while failing at runtime.
 *
 * See https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/models/replay_detection.js
 */
export type ReplayDetectionClass = Provider['ReplayDetection'] & {
  unique: (iss: string, jti: string, exp?: number) => Promise<boolean>;
};

export const getProviderConfiguration = (provider: Provider) => instance(provider).configuration;
