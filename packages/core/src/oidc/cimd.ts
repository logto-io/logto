/**
 * @overview OAuth Client ID Metadata Document (CIMD) support.
 *
 * CIMD lets an OAuth client use a public HTTPS URL as its `client_id`; the URL serves the client
 * metadata JSON document. The oidc-provider fork implements the draft-02 resolver, fetch, cache,
 * validation, and discovery natively — this module wires the feature into the provider and
 * exposes the shared enablement predicate.
 *
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-02.html | draft-02}
 */

import { conditional, type Optional } from '@silverhand/essentials';
import { type Client, type KoaContextWithOIDC } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

/**
 * Must not exceed the `cimd_client_id varchar(2048)` column width — neither the draft nor the
 * provider defines a maximum, so this bound is what keeps an over-long identifier an
 * `invalid_client` rather than a database error.
 */
const cimdClientIdMaxLength = 2048;

/**
 * Whether CIMD is effectively enabled for the tenant. All three conditions must hold:
 *
 * - The development features flag is on (release guard);
 * - The tenant has enabled CIMD in its configs;
 * - The provider SSRF protection is active — CIMD forces outbound fetches, so it hard-requires
 *   the SSRF-protected dispatcher. Disabling the protection (self-hosted only) turns CIMD off
 *   regardless of the stored config: the Management API's enable-time 422 only fails fast on the
 *   honest path, since the env can be flipped after the config is stored.
 *
 * Provider construction is the authoritative gate — the tenant is rebuilt when the stored config
 * changes, so every predicate consumer observes the same value for the provider's lifetime.
 */
export const isCimdEffectivelyEnabled = (envSet: EnvSet): boolean =>
  // DEV: CIMD (client ID metadata document) support
  EnvSet.values.isDevFeaturesEnabled &&
  envSet.oidc.cimdEnabled &&
  EnvSet.values.isOidcProviderSsrfProtectionEnabled;

/**
 * Build the `features.clientIdMetadataDocument` entry for the provider configuration, or
 * `undefined` when CIMD is not effectively enabled — with the entry absent the fork keeps the
 * feature disabled, so the provider skips CIMD client resolution and discovery only publishes
 * `client_id_metadata_document_supported` when effective.
 *
 * The `ack` pins the implemented draft version: the provider constructor throws when a fork
 * upgrade changes the implemented version, forcing a deliberate review instead of a silent
 * behavior change.
 *
 * The explicit return type stands in for `@types/oidc-provider`, which does not declare this
 * draft feature of the fork. A falsy return from either callback makes the provider throw
 * `InvalidClient`.
 */
export const buildClientIdMetadataDocumentFeature = (
  envSet: EnvSet
): Optional<{
  clientIdMetadataDocument: {
    enabled: true;
    ack: 'draft-02';
    allowFetch: (ctx: KoaContextWithOIDC | undefined, clientId: string) => boolean;
    allowClient: (ctx: KoaContextWithOIDC | undefined, client: Client) => boolean;
  };
}> =>
  conditional(
    isCimdEffectivelyEnabled(envSet) && {
      clientIdMetadataDocument: {
        enabled: true,
        ack: 'draft-02',
        allowFetch: (_ctx: KoaContextWithOIDC | undefined, clientId: string) =>
          clientId.length <= cimdClientIdMaxLength,
        /** Cache hits skip `allowFetch`, so the bound must repeat here. */
        allowClient: (_ctx: KoaContextWithOIDC | undefined, client: Client) =>
          client.clientId.length <= cimdClientIdMaxLength,
      },
    }
  );
