import { UserScope } from '@logto/core-kit';
import { createMockUtils } from '@logto/shared/esm';
import { type AllClientMetadata, type Client } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const loadCimdModule = async ({
  isDevFeaturesEnabled = true,
  isOidcProviderSsrfProtectionEnabled = true,
} = {}) => {
  jest.resetModules();
  mockEsm('#src/env-set/index.js', () => ({
    EnvSet: {
      values: { isDevFeaturesEnabled, isOidcProviderSsrfProtectionEnabled },
    },
  }));

  return import('./index.js');
};

const buildEnvSet = (cimdEnabled: boolean, jwkSigningAlg?: 'ES256' | 'ES384' | 'ES512'): EnvSet => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the fields the module reads
  return { oidc: { cimdEnabled, jwkSigningAlg } } as EnvSet;
};

const buildCimdQueries = (findAllUserScopes: () => Promise<UserScope[]> = async () => []) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal queries stub scoped to the methods the transform reads
  return {
    userScopes: { findAll: findAllUserScopes },
  } as Queries['cimd'];
};

const cimdClientIdMaxLength = 2048;

const buildClientId = (length: number) =>
  `https://example.com/${'a'.repeat(length - 'https://example.com/'.length)}`;

const buildClient = (
  clientId: string,
  idTokenSignedResponseAlg?: string,
  metadata: AllClientMetadata = {}
): Client => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub scoped to the fields the hook reads
  return { clientId, idTokenSignedResponseAlg, metadata: () => metadata } as Client;
};

/**
 * `jest.resetModules` gives cimd.js its own `oidc-provider` module instance, so class identity
 * assertions on thrown errors would fail; assert on the thrown shape instead — the OIDC error
 * code lives in `message` and the human-readable text in `error_description`.
 */
const captureThrown = (run: () => unknown): unknown => {
  try {
    run();
    return undefined;
  } catch (error: unknown) {
    return error;
  }
};

const loadEnabledFeature = async ({
  jwkSigningAlg,
  ceilingUserScopes = [],
}: {
  jwkSigningAlg?: 'ES256' | 'ES384' | 'ES512';
  ceilingUserScopes?: UserScope[];
} = {}) => {
  const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
  const findAllUserScopes = jest.fn(async () => ceilingUserScopes);
  const feature = buildClientIdMetadataDocumentFeature(
    buildEnvSet(true, jwkSigningAlg),
    buildCimdQueries(findAllUserScopes)
  );

  if (!feature) {
    throw new Error('Expected the CIMD feature to be built');
  }

  return { ...feature.clientIdMetadataDocument, findAllUserScopes };
};

describe('isCimdEffectivelyEnabled', () => {
  it('is enabled only when all three conditions hold', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule();
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(true);
  });

  it('is disabled when the dev features flag is off', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule({ isDevFeaturesEnabled: false });
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(false);
  });

  it('is disabled when the tenant config is off', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule();
    expect(isCimdEffectivelyEnabled(buildEnvSet(false))).toBe(false);
  });

  it('is disabled when the provider SSRF protection is off, regardless of the stored config', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule({
      isOidcProviderSsrfProtectionEnabled: false,
    });
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(false);
  });
});

describe('isInCimdNamespace', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  it('is in the namespace for a url-shaped identifier', async () => {
    const { isInCimdNamespace } = await loadCimdModule();
    expect(isInCimdNamespace(cimdClientId)).toBe(true);
  });

  it('is not in the namespace for a registered application id or a missing identifier', async () => {
    const { isInCimdNamespace } = await loadCimdModule();
    expect(isInCimdNamespace('app-id')).toBe(false);
    expect(isInCimdNamespace()).toBe(false);
  });

  it('is not in the namespace when the dev features flag is off', async () => {
    const { isInCimdNamespace } = await loadCimdModule({ isDevFeaturesEnabled: false });
    expect(isInCimdNamespace(cimdClientId)).toBe(false);
  });

  it('is in the namespace regardless of the tenant cimd config', async () => {
    const { isInCimdNamespace } = await loadCimdModule({
      isOidcProviderSsrfProtectionEnabled: false,
    });
    expect(isInCimdNamespace(cimdClientId)).toBe(true);
  });
});

describe('getClientIdentifierPayload', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  it('routes a cimd-namespace identifier to the dedicated key', async () => {
    const { getClientIdentifierPayload } = await loadCimdModule();
    expect(getClientIdentifierPayload(cimdClientId)).toStrictEqual({
      cimdClientId,
    });
  });

  it('routes a registered application id to applicationId', async () => {
    const { getClientIdentifierPayload } = await loadCimdModule();
    expect(getClientIdentifierPayload('app-id')).toStrictEqual({
      applicationId: 'app-id',
    });
  });

  it('keeps a url-shaped identifier under applicationId when the dev features flag is off', async () => {
    const { getClientIdentifierPayload } = await loadCimdModule({ isDevFeaturesEnabled: false });
    expect(getClientIdentifierPayload(cimdClientId)).toStrictEqual({
      applicationId: cimdClientId,
    });
  });

  it('yields an undefined applicationId for a missing identifier', async () => {
    const { getClientIdentifierPayload } = await loadCimdModule();
    expect(getClientIdentifierPayload()).toStrictEqual({
      applicationId: undefined,
    });
  });
});

describe('isCimdClient', () => {
  const cimdClientId = 'https://client.example.com/client-metadata.json';

  it('is a cimd client when the feature is effective and the identifier is url-shaped', async () => {
    const { isCimdClient } = await loadCimdModule();
    expect(isCimdClient(buildEnvSet(true), cimdClientId)).toBe(true);
  });

  it('is not a cimd client for a registered application id', async () => {
    const { isCimdClient } = await loadCimdModule();
    expect(isCimdClient(buildEnvSet(true), 'registered_client_id')).toBe(false);
  });

  it('is not a cimd client without an identifier', async () => {
    const { isCimdClient } = await loadCimdModule();
    expect(isCimdClient(buildEnvSet(true))).toBe(false);
  });

  it('is not a cimd client when the feature is not effectively enabled', async () => {
    const { isCimdClient } = await loadCimdModule();
    expect(isCimdClient(buildEnvSet(false), cimdClientId)).toBe(false);
  });
});

describe('buildClientIdMetadataDocumentFeature', () => {
  it('wires the feature with the draft-02 acknowledgement when effectively enabled', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
    expect(
      buildClientIdMetadataDocumentFeature(buildEnvSet(true), buildCimdQueries())
    ).toMatchObject({
      clientIdMetadataDocument: { enabled: true, ack: 'draft-02' },
    });
  });

  it('does not wire the feature at all when the dev features flag is off', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule({
      isDevFeaturesEnabled: false,
    });
    expect(
      buildClientIdMetadataDocumentFeature(buildEnvSet(true), buildCimdQueries())
    ).toBeUndefined();
  });

  it('does not wire the feature when not effectively enabled', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
    expect(
      buildClientIdMetadataDocumentFeature(buildEnvSet(false), buildCimdQueries())
    ).toBeUndefined();
  });
});

describe('client identifier length bound', () => {
  const overLengthRejection = {
    message: 'invalid_client',
    error_description: `client_id must not exceed ${cimdClientIdMaxLength} characters`,
  };

  it('allowFetch accepts an identifier at the bound and rejects one past it', async () => {
    const { allowFetch } = await loadEnabledFeature();
    expect(allowFetch(undefined, buildClientId(cimdClientIdMaxLength))).toBe(true);
    expect(
      captureThrown(() => allowFetch(undefined, buildClientId(cimdClientIdMaxLength + 1)))
    ).toMatchObject(overLengthRejection);
  });

  it('allowClient accepts a client at the bound and rejects one past it', async () => {
    const { allowClient } = await loadEnabledFeature();
    expect(allowClient(undefined, buildClient(buildClientId(cimdClientIdMaxLength)))).toBe(true);
    expect(
      captureThrown(() =>
        allowClient(undefined, buildClient(buildClientId(cimdClientIdMaxLength + 1)))
      )
    ).toMatchObject(overLengthRejection);
  });
});

describe('server-side metadata takeover', () => {
  it('overrides the document scope with the tenant user-scope ceiling and pins grant and response types', async () => {
    const { transformClientMetadata } = await loadEnabledFeature({
      ceilingUserScopes: [UserScope.Profile, UserScope.Email],
    });

    await expect(
      transformClientMetadata(undefined, {
        scope: 'openid phone custom:unknown',
        grant_types: ['client_credentials', 'implicit'],
        response_types: ['id_token'],
      })
    ).resolves.toEqual({
      scope: 'openid offline_access profile email',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    });
  });

  it('pins the server-side values when the document omits the fields, with an empty ceiling denying all user scopes', async () => {
    const { transformClientMetadata } = await loadEnabledFeature();

    await expect(transformClientMetadata(undefined, {})).resolves.toEqual({
      scope: 'openid offline_access',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    });
  });

  it('re-reads the user-scope ceiling on every client resolution so changes apply immediately', async () => {
    const { transformClientMetadata, findAllUserScopes } = await loadEnabledFeature({
      ceilingUserScopes: [UserScope.Profile],
    });

    await expect(transformClientMetadata(undefined, {})).resolves.toMatchObject({
      scope: 'openid offline_access profile',
    });

    // A memoized implementation would keep serving the first result; the ceiling must be
    // re-queried per resolution for tenant changes to apply without a provider rebuild.
    findAllUserScopes.mockResolvedValueOnce([UserScope.Profile, UserScope.Email]);

    await expect(transformClientMetadata(undefined, {})).resolves.toMatchObject({
      scope: 'openid offline_access profile email',
    });
    expect(findAllUserScopes).toHaveBeenCalledTimes(2);
  });

  it('passes the other document fields through untouched', async () => {
    const { transformClientMetadata } = await loadEnabledFeature();

    await expect(
      transformClientMetadata(undefined, {
        client_id: 'https://client.example.com/oauth/metadata',
        client_name: 'Example MCP client',
        redirect_uris: ['https://app.example.com/callback'],
        token_endpoint_auth_method: 'none',
      })
    ).resolves.toEqual({
      client_id: 'https://client.example.com/oauth/metadata',
      client_name: 'Example MCP client',
      redirect_uris: ['https://app.example.com/callback'],
      token_endpoint_auth_method: 'none',
      scope: 'openid offline_access',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    });
  });
});

describe('ID token signing algorithm guard', () => {
  const clientId = buildClientId(64);

  it('allowClient accepts the tenant signing algorithm and an omitted declaration on an EC tenant', async () => {
    const { allowClient } = await loadEnabledFeature({ jwkSigningAlg: 'ES384' });
    expect(allowClient(undefined, buildClient(clientId, 'ES384'))).toBe(true);
    expect(allowClient(undefined, buildClient(clientId))).toBe(true);
  });

  it('allowClient rejects a declaration the EC tenant signing key cannot sign', async () => {
    const { allowClient } = await loadEnabledFeature({ jwkSigningAlg: 'ES384' });

    expect(
      captureThrown(() => allowClient(undefined, buildClient(clientId, 'RS256')))
    ).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'id_token_signed_response_alg RS256 cannot be signed with the tenant signing key',
    });
  });

  it('allowClient does not guard the algorithm when the tenant key derives none', async () => {
    const { allowClient } = await loadEnabledFeature();
    expect(allowClient(undefined, buildClient(clientId, 'RS256'))).toBe(true);
    expect(allowClient(undefined, buildClient(clientId, 'ES384'))).toBe(true);
  });
});

describe('private metadata deny', () => {
  const clientId = buildClientId(64);

  it('allowClient rejects a document carrying a custom client metadata key', async () => {
    const { allowClient } = await loadEnabledFeature();

    expect(
      captureThrown(() =>
        allowClient(
          undefined,
          buildClient(clientId, undefined, { corsAllowedOrigins: ['https://app.example.com'] })
        )
      )
    ).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'client_id metadata document must not contain Logto private metadata (corsAllowedOrigins)',
    });
  });

  it('allowClient rejects a document carrying the app-level access control key', async () => {
    const { allowClient } = await loadEnabledFeature();

    expect(
      captureThrown(() =>
        allowClient(
          undefined,
          buildClient(clientId, undefined, { appLevelAccessControlEnabled: true })
        )
      )
    ).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'client_id metadata document must not contain Logto private metadata (appLevelAccessControlEnabled)',
    });
  });
});

describe('wildcard redirect URI pattern validation', () => {
  const clientId = buildClientId(64);

  it('allowClient accepts exact URIs and supported wildcard patterns', async () => {
    const { allowClient } = await loadEnabledFeature();

    expect(
      allowClient(
        undefined,
        buildClient(clientId, undefined, {
          redirect_uris: ['https://app.example.com/callback', 'https://*.example.com/callback'],
          post_logout_redirect_uris: ['https://*.example.com/signed-out'],
        })
      )
    ).toBe(true);
  });

  it('allowClient rejects a pattern the runtime matcher would never match', async () => {
    const { allowClient } = await loadEnabledFeature();

    expect(
      captureThrown(() =>
        allowClient(
          undefined,
          buildClient(clientId, undefined, { redirect_uris: ['https://*.com/callback'] })
        )
      )
    ).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'client_id metadata document contains an unsupported wildcard redirect URI pattern (https://*.com/callback)',
    });
  });

  it('allowClient validates post_logout_redirect_uris with the same rules', async () => {
    const { allowClient } = await loadEnabledFeature();

    expect(
      captureThrown(() =>
        allowClient(
          undefined,
          buildClient(clientId, undefined, {
            post_logout_redirect_uris: ['https://example.*/signed-out'],
          })
        )
      )
    ).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'client_id metadata document contains an unsupported wildcard redirect URI pattern (https://example.*/signed-out)',
    });
  });
});
