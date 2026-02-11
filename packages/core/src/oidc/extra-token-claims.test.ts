import { InteractionEvent } from '@logto/schemas';
import Router from 'koa-router';
import { type AccessToken, type KoaContextWithOIDC } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const runScriptInLocalVm = jest.fn().mockResolvedValue({});

jest.unstable_mockModule('#src/libraries/jwt-customizer.js', () => ({
  JwtCustomizerLibrary: {
    runScriptInLocalVm,
  },
}));

const { getExtraTokenClaimsForJwtCustomization } = await import('./extra-token-claims.js');

describe('getExtraTokenClaimsForJwtCustomization', () => {
  it('includes sign-in context in interaction context when lastSubmission has it', async () => {
    const accountId = 'user-1';
    const sessionUid = 'session-1';
    const signInContext = { country: 'US' };

    const oidcSessionExtensions = {
      findBySessionUid: jest.fn().mockResolvedValue({
        accountId,
        lastSubmission: {
          interactionEvent: InteractionEvent.SignIn,
          userId: accountId,
          verificationRecords: [],
          signInContext,
        },
      }),
    };

    const tenant = new MockTenant(
      undefined,
      { oidcSessionExtensions },
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
        }),
      }
    );

    const ctx = createOidcContext({
      session: { uid: sessionUid } as unknown as KoaContextWithOIDC['oidc']['session'],
      client: { clientId: 'app-1' } as unknown as KoaContextWithOIDC['oidc']['client'],
    });

    const logEntry = { append: jest.fn() };
    const ctxWithLog = {
      ...ctx,
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

    await getExtraTokenClaimsForJwtCustomization(ctxWithLog, token, {
      envSet: tenant.envSet,
      queries: tenant.queries,
      libraries: tenant.libraries,
      logtoConfigs: tenant.logtoConfigs,
    });

    expect(runScriptInLocalVm.mock.calls[0]?.[0]).toMatchObject({
      context: {
        interaction: {
          signInContext,
        },
      },
    });
  });
});
