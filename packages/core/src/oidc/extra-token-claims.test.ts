import { InteractionEvent } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import Router from 'koa-router';
import { type AccessToken, errors, type KoaContextWithOIDC } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const runScriptInLocalVm = jest.fn().mockResolvedValue({});
const accountId = 'user-1';
const sessionUid = 'session-1';

jest.unstable_mockModule('@logto/app-insights/node', () => ({
  appInsights: {
    trackException: jest.fn(),
  },
}));

jest.unstable_mockModule('#src/libraries/jwt-customizer.js', () => ({
  JwtCustomizerLibrary: {
    runScriptInLocalVm,
  },
}));

const { EnvSet } = await import('#src/env-set/index.js');
const { getExtraTokenClaimsForJwtCustomization } = await import('./extra-token-claims.js');

const buildContextAndToken = () => {
  const ctx = createOidcContext({
    session: { uid: sessionUid } as unknown as KoaContextWithOIDC['oidc']['session'],
    client: { clientId: 'app-1' } as unknown as KoaContextWithOIDC['oidc']['client'],
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

  return { ctxWithLog, token };
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
}: {
  blockIssuanceOnError?: boolean;
  signInContext?: Record<string, string>;
}) => {
  const tenant = createTenant({ blockIssuanceOnError, signInContext });
  const { ctxWithLog, token } = buildContextAndToken();

  return getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
    envSet: tenant.envSet,
    queries: tenant.queries,
    libraries: tenant.libraries,
    logtoConfigs: tenant.logtoConfigs,
  });
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
    runScriptInLocalVm.mockReset().mockResolvedValue({});
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('includes sign-in context in interaction context when lastSubmission has it', async () => {
    await callGetExtraTokenClaimsForJwtCustomization({});

    expect(runScriptInLocalVm.mock.calls[0]?.[0]).toMatchObject({
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

    expect(runScriptInLocalVm.mock.calls[0]?.[0]).toMatchObject({
      context: {
        interaction: {
          signInContext,
        },
      },
    });
  });

  it('throws server error on script failure when blocking is enabled and dev features enabled', async () => {
    runScriptInLocalVm.mockRejectedValue(new Error('boom'));

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).rejects.toBeInstanceOf(Error);
  });

  it('keeps fail-open on script failure when dev features are disabled', async () => {
    runScriptInLocalVm.mockRejectedValue(new Error('boom'));
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await expect(
      callGetExtraTokenClaimsForJwtCustomization({ blockIssuanceOnError: true })
    ).resolves.toBeUndefined();
  });

  it('throws access denied when denyAccess is called in custom script', async () => {
    runScriptInLocalVm.mockRejectedValue(
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
    ).rejects.toBeInstanceOf(errors.AccessDenied);
  });
});
