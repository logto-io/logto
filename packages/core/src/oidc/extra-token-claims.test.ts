import { InteractionEvent } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import Router from 'koa-router';
import { errors, type AccessToken, type KoaContextWithOIDC } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const runScriptLocally = jest.fn().mockResolvedValue({});
const accountId = 'user-1';
const sessionUid = 'session-1';

jest.unstable_mockModule('@logto/app-insights/node', () => ({
  appInsights: {
    trackException: jest.fn(),
  },
}));

jest.unstable_mockModule('#src/libraries/jwt-customizer.js', () => ({
  JwtCustomizerLibrary: {
    runScriptLocally,
  },
}));

const { EnvSet } = await import('#src/env-set/index.js');
const { getExtraTokenClaimsForJwtCustomization } = await import('./extra-token-claims.js');

const buildContextAndToken = ({
  organizationId,
  clientId = 'app-1',
}: { organizationId?: string; clientId?: string } = {}) => {
  const ctx = createOidcContext({
    session: { uid: sessionUid } as unknown as KoaContextWithOIDC['oidc']['session'],
    client: { clientId } as unknown as KoaContextWithOIDC['oidc']['client'],
    params: { organization_id: organizationId },
  });

  const logEntry = { append: jest.fn() };
  const ctxWithLog = {
    ...ctx,
    headers: {
      host: 'localhost:3001',
    },
    params: {},
    router: new Router(),
    _matchedRoute: undefined,
    _matchedRouteName: undefined,
    createLog: jest.fn().mockReturnValue(logEntry),
    prependAllLogEntries: jest.fn(),
  } satisfies Parameters<typeof getExtraTokenClaimsForJwtCustomization>[0];

  const token = Object.create(ctx.oidc.provider.AccessToken.prototype, {
    accountId: { value: accountId, enumerable: true },
    sessionUid: { value: sessionUid, enumerable: true },
    gty: { value: 'password', enumerable: true },
  }) as AccessToken;

  return { ctxWithLog, token, logEntry };
};

const mockOrganization = {
  id: 'org-1',
  name: 'My Organization',
  description: null,
  customData: { internalId: 'internal-1' },
};

const createTenant = ({
  blockIssuanceOnError,
  signInContext = { country: 'US' },
}: {
  blockIssuanceOnError?: boolean;
  signInContext?: Record<string, string>;
}) =>
  new MockTenant(
    undefined,
    {
      oidcSessionExtensions: {
        findBySessionUid: jest.fn().mockResolvedValue({
          accountId,
          lastSubmission: {
            interactionEvent: InteractionEvent.SignIn,
            userId: accountId,
            verificationRecords: [],
            signInContext,
          },
        }),
      },
    },
    undefined,
    {
      jwtCustomizers: {
        getUserContext: jest.fn().mockResolvedValue({ id: accountId }),
        // eslint-disable-next-line unicorn/no-useless-undefined
        getApplicationContext: jest.fn().mockResolvedValue(undefined),
        getOrganizationContext: jest.fn().mockResolvedValue(mockOrganization),
      },
    },
    {
      getJwtCustomizer: jest.fn().mockResolvedValue({
        script: 'return {}',
        environmentVariables: {},
        blockIssuanceOnError,
      }),
    }
  );

const callGetExtraTokenClaimsForJwtCustomization = async ({
  blockIssuanceOnError,
  signInContext,
  organizationId,
}: {
  blockIssuanceOnError?: boolean;
  signInContext?: Record<string, string>;
  organizationId?: string;
}) => {
  const tenant = createTenant({ blockIssuanceOnError, signInContext });
  const { ctxWithLog, token } = buildContextAndToken({ organizationId });

  return getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
    envSet: tenant.envSet,
    queries: tenant.queries,
    libraries: tenant.libraries,
    logtoConfigs: tenant.logtoConfigs,
  });
};

const runJwtCustomizationWithClientId = async (clientId: string) => {
  const tenant = createTenant({});
  const { ctxWithLog, token, logEntry } = buildContextAndToken({ clientId });

  await getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
    envSet: tenant.envSet,
    queries: tenant.queries,
    libraries: tenant.libraries,
    logtoConfigs: tenant.logtoConfigs,
  });

  return logEntry;
};

const createResponseError = (status: number, body: Record<string, unknown>) =>
  new ResponseError(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );

describe('getExtraTokenClaimsForJwtCustomization', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  beforeEach(() => {
    runScriptLocally.mockReset().mockResolvedValue({});
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('includes sign-in context in interaction context when lastSubmission has it', async () => {
    await callGetExtraTokenClaimsForJwtCustomization({});

    expect(runScriptLocally.mock.calls[0]?.[0]).toMatchObject({
      context: {
        interaction: {
          signInContext: { country: 'US' },
        },
      },
    });
  });

  it('includes adaptive MFA sign-in context in custom claims payload when dev features are disabled', async () => {
    const signInContext = { country: 'US', botScore: '10' };
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await callGetExtraTokenClaimsForJwtCustomization({ signInContext });

    expect(runScriptLocally.mock.calls[0]?.[0]).toMatchObject({
      context: {
        interaction: {
          signInContext,
        },
      },
    });
  });

  it('includes target organization context for organization (API resource) tokens', async () => {
    await callGetExtraTokenClaimsForJwtCustomization({ organizationId: 'org-1' });

    expect(runScriptLocally.mock.calls[0]?.[0]).toMatchObject({
      context: {
        organization: {
          id: 'org-1',
          name: 'My Organization',
          description: null,
          customData: { internalId: 'internal-1' },
        },
      },
    });
  });

  it('omits organization context when no organization_id is present', async () => {
    await callGetExtraTokenClaimsForJwtCustomization({});

    expect(runScriptLocally.mock.calls[0]?.[0]?.context).not.toHaveProperty('organization');
  });

  describe('for CIMD clients', () => {
    const cimdClientId = 'https://client.example.com/metadata.json';

    it('skips the application context lookup while CIMD is effectively enabled', async () => {
      const tenant = createTenant({});
      const { ctxWithLog, token } = buildContextAndToken({ clientId: cimdClientId });

      /**
       * The gate additionally reads the static dev-features and SSRF-protection flags from
       * `EnvSet.values`; the jest environment keeps both on.
       */
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- spread copy of the mock env set with the tenant CIMD toggle on; `oidc` is a getter and must be rebuilt explicitly
      const cimdEnvSet = {
        ...tenant.envSet,
        oidc: { ...tenant.envSet.oidc, cimdEnabled: true },
      } as InstanceType<typeof EnvSet>;

      await getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
        envSet: cimdEnvSet,
        queries: tenant.queries,
        libraries: tenant.libraries,
        logtoConfigs: tenant.logtoConfigs,
      });

      expect(tenant.libraries.jwtCustomizers.getApplicationContext).not.toHaveBeenCalled();
      expect(runScriptLocally.mock.calls[0]?.[0]?.context).not.toHaveProperty('application');
    });

    it('keeps the application context lookup for a url client id when CIMD is not effectively enabled', async () => {
      const tenant = createTenant({});
      const { ctxWithLog, token } = buildContextAndToken({ clientId: cimdClientId });

      await getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
        envSet: tenant.envSet,
        queries: tenant.queries,
        libraries: tenant.libraries,
        logtoConfigs: tenant.logtoConfigs,
      });

      expect(tenant.libraries.jwtCustomizers.getApplicationContext).toHaveBeenCalledWith(
        tenant.envSet.tenantId,
        cimdClientId
      );
    });
  });

  it('throws invalid request with original error message on script failure when blocking is enabled', async () => {
    runScriptLocally.mockRejectedValue(new Error('boom'));

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).rejects.toMatchObject({
      error: 'invalid_request',
      error_description: 'Custom claims script error: boom',
      statusCode: 400,
    });
  });

  it('throws invalid request with parsed response error message when blocking is enabled', async () => {
    runScriptLocally.mockRejectedValue(
      createResponseError(422, {
        message: "'abc' not exists in 'context'.",
      })
    );

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).rejects.toMatchObject({
      error: 'invalid_request',
      error_description: "Custom claims script error: 'abc' not exists in 'context'.",
      statusCode: 400,
    });
  });

  it('keeps fail-open on script failure when dev features are disabled', async () => {
    runScriptLocally.mockRejectedValue(new Error('boom'));
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).resolves.toBeUndefined();
  });

  it('throws access denied when denyAccess is called in custom script', async () => {
    runScriptLocally.mockRejectedValue(
      createResponseError(403, {
        message: 'blocked',
        error: {
          code: 'AccessDenied',
          message: 'blocked',
        },
      })
    );

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).rejects.toMatchObject({
      error: 'access_denied',
      statusCode: 400,
    });
  });

  it('throws oidc invalid request error type for block-on-error failures', async () => {
    runScriptLocally.mockRejectedValue(new Error('boom'));

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).rejects.toBeInstanceOf(errors.InvalidRequest);
  });

  describe('log attribution for a cimd client identifier', () => {
    const cimdClientId = 'https://client.example.com/metadata.json';

    it('routes the identifier to the dedicated key', async () => {
      const logEntry = await runJwtCustomizationWithClientId(cimdClientId);

      const payload: unknown = logEntry.append.mock.calls[0]?.[0];
      expect(payload).toHaveProperty('cimdClientId', cimdClientId);
      expect(payload).not.toHaveProperty('applicationId');
    });
  });
});
