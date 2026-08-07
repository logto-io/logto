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

import { ReservedScope } from '@logto/core-kit';
import { GrantType } from '@logto/schemas';
import { conditional, type Optional } from '@silverhand/essentials';
import {
  type AllClientMetadata,
  type Client,
  errors,
  type KoaContextWithOIDC,
} from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

import { extraClientMetadataKeys } from '../application-access-control.js';
import { isValidWildcardRedirectUriPattern } from '../redirect-uri/utils.js';

import { isCimdClientId } from './client-id.js';

/**
 * Must not exceed the `cimd_client_id varchar(2048)` column width — neither the draft nor the
 * provider defines a maximum, so this bound is what keeps an over-long identifier an
 * `invalid_client` rather than a database error.
 */
const cimdClientIdMaxLength = 2048;

const assertClientIdWithinLengthBound = (clientId: string) => {
  if (clientId.length > cimdClientIdMaxLength) {
    throw new errors.InvalidClient(`client_id must not exceed ${cimdClientIdMaxLength} characters`);
  }
};

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

/** At most one identifier is set, matching the namespace of the client identifier. */
export type ClientIdentifierPayload = {
  applicationId?: string;
  cimdClientId?: string;
};

/**
 * Route a client identifier into the payload key its namespace owns: `applicationId` carries
 * registered application ids only, while an identifier in the CIMD namespace goes under the
 * dedicated `cimdClientId` key — audit log and webhook consumers branch on key presence instead
 * of parsing URL shapes.
 *
 * The namespace alone decides, deliberately ignoring the tenant CIMD config: the config can flip
 * between an interaction's creation and its payload emission (the tenant is rebuilt on config
 * change), and routing by it would put the in-flight interaction's URL identifier under
 * `applicationId`, breaking the registered-only contract. The key attributes the identifier the
 * requester presented, not a resolved client — an identifier that later fails resolution still
 * lands under `cimdClientId`.
 */
export const getClientIdentifierPayload = (clientId?: string): ClientIdentifierPayload =>
  // DEV: CIMD (client ID metadata document) support
  clientId !== undefined && EnvSet.values.isDevFeaturesEnabled && isCimdClientId(clientId)
    ? { cimdClientId: clientId }
    : { applicationId: clientId };

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
 * draft feature of the fork. Both callbacks reject by throwing specific OIDC errors — the fork
 * propagates them to the client as-is, while a falsy return would only yield the generic
 * `InvalidClient` with no failure reason.
 */
export const buildClientIdMetadataDocumentFeature = (
  envSet: EnvSet,
  cimdQueries: Queries['cimd']
): Optional<{
  clientIdMetadataDocument: {
    enabled: true;
    ack: 'draft-02';
    allowFetch: (ctx: KoaContextWithOIDC | undefined, clientId: string) => boolean;
    transformClientMetadata: (
      ctx: KoaContextWithOIDC | undefined,
      metadata: AllClientMetadata
    ) => Promise<AllClientMetadata>;
    allowClient: (ctx: KoaContextWithOIDC | undefined, client: Client) => boolean;
  };
}> =>
  conditional(
    isCimdEffectivelyEnabled(envSet) && {
      clientIdMetadataDocument: {
        enabled: true,
        ack: 'draft-02',
        allowFetch: (_ctx: KoaContextWithOIDC | undefined, clientId: string) => {
          assertClientIdWithinLengthBound(clientId);
          return true;
        },
        /**
         * `scope` and `grant_types` are server-owned — registered applications never
         * take them from client input — so the document's declarations are replaced,
         * not honored. The override must happen before the client schema runs: declared
         * values the provider does not recognize would reject the whole client.
         *
         * - `scope` carries the tenant's user-scope ceiling so enforcement runs through
         *   the provider's native `check_scope` like third-party applications, which
         *   also covers PAR.
         *   TODO: @xiaoyijun enforce the resource and organization scope ceilings on the
         *   resource-server filter path (LOG-13927, LOG-13930).
         * - `grant_types`: a remote document must not self-grant client_credentials,
         *   device code, or token exchange, which registered applications only get by
         *   type or explicit opt-in.
         * - `response_types` must be pinned too, or the schema re-derives the implicit
         *   grant from a declared response type.
         */
        transformClientMetadata: async (
          _ctx: KoaContextWithOIDC | undefined,
          metadata: AllClientMetadata
        ): Promise<AllClientMetadata> => ({
          ...metadata,
          scope: [
            ReservedScope.OpenId,
            ReservedScope.OfflineAccess,
            ...(await cimdQueries.userScopes.findAll()),
          ].join(' '),
          grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
          response_types: ['code'],
        }),
        /**
         * Runs on every use of a CIMD client including metadata-cache hits (a cached document
         * can be up to 24 hours old), so tenant policy always applies before the client is
         * used. The length bound must repeat here because cache hits skip `allowFetch`.
         */
        allowClient: (_ctx: KoaContextWithOIDC | undefined, client: Client) => {
          assertClientIdWithinLengthBound(client.clientId);

          /**
           * The client schema only checks the algorithm against the product-level allowlist —
           * a declaration the tenant's current signing key cannot sign would fail late at
           * token issuance with a server error. RSA tenants derive no algorithm and can sign
           * the built-in `RS256` default, so there is nothing to enforce for them.
           */
          const { idTokenSignedResponseAlg } = client;
          const { jwkSigningAlg } = envSet.oidc;

          if (
            jwkSigningAlg &&
            idTokenSignedResponseAlg &&
            idTokenSignedResponseAlg !== jwkSigningAlg
          ) {
            throw new errors.InvalidClientMetadata(
              `id_token_signed_response_alg ${idTokenSignedResponseAlg} cannot be signed with the tenant signing key`
            );
          }

          const metadata = client.metadata();

          /**
           * Logto private client metadata that a remote CIMD document must never carry. The
           * provider recognizes exactly {@link extraClientMetadataKeys}, so without this deny
           * a remote document could set those keys and have them honored.
           */
          const forbiddenKey = extraClientMetadataKeys.find((key) => metadata[key] !== undefined);

          if (forbiddenKey) {
            throw new errors.InvalidClientMetadata(
              `client_id metadata document must not contain Logto private metadata (${forbiddenKey})`
            );
          }

          /**
           * An unsupported wildcard pattern never matches at runtime, so pre-validating with
           * the matcher's own parser turns a dead registration into an upfront error naming
           * the pattern instead of an unexplained redirect_uri mismatch at authorization.
           */
          const invalidPattern = [
            ...(metadata.redirect_uris ?? []),
            ...(metadata.post_logout_redirect_uris ?? []),
          ].find((uri) => uri.includes('*') && !isValidWildcardRedirectUriPattern(uri));

          if (invalidPattern !== undefined) {
            throw new errors.InvalidClientMetadata(
              `client_id metadata document contains an unsupported wildcard redirect URI pattern (${invalidPattern})`
            );
          }

          return true;
        },
      },
    }
  );
