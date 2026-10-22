import { AdditionalIdentifier, LogtoAcr, VerificationType, type Application } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { type Partial2 } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { MockTenant } from '../../test-utils/tenant.js';

import { verificationRecordIdHeader } from './constants.js';
import type { WithAuthContext } from './index.js';

const { jest } = import.meta;

const provider = new Provider('https://logto.test');

const mockAccessToken = {
  accountId: 'fooUser',
  clientId: 'fooClient',
  scopes: new Set(['openid']),
};

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const koaOidcAuth = await pickDefault(import('./koa-oidc-auth.js'));

const baseCtx = createContextWithRouteParameters();

const ctx: WithAuthContext<Context & IRouterParamContext> = {
  ...baseCtx,
  auth: {
    type: 'user',
    id: '',
    scopes: new Set(),
  },
};

const next = jest.fn();

/**
 * A tenant whose application lookup resolves the access token's client, so the OIDC branch can
 * tell a first-party application from a third-party one.
 */
const createTenantWithApplication = (
  application: Partial<Application> | undefined,
  verificationRecordsData?: Record<string, unknown>
) =>
  new MockTenant(provider, {
    applications: {
      findApplicationById: jest.fn(async () => {
        if (!application) {
          throw new RequestError({ code: 'entity.not_exists_with_id', status: 404 });
        }

        return { ...mockApplication, ...application };
      }),
    },
    ...(verificationRecordsData && {
      verificationRecords: {
        findActiveVerificationRecordById: jest.fn(async (id: string) => ({
          id,
          userId: mockAccessToken.accountId,
          data: verificationRecordsData,
          expiresAt: Date.now() + 60_000,
        })),
      },
    }),
  } as unknown as Partial2<Queries>);

/** A token whose client is the given first-party or third-party application. */
const buildAccessToken = (extra: unknown, clientId = mockAccessToken.clientId) => ({
  ...mockAccessToken,
  clientId,
  extra,
});

const runMiddleware = async (
  tenant: MockTenant,
  accessToken: unknown,
  verificationRecordId?: string
) => {
  ctx.request = {
    ...baseCtx.request,
    headers: {
      authorization: 'Bearer access_token',
      ...(verificationRecordId && { [verificationRecordIdHeader]: verificationRecordId }),
    },
  };
  Sinon.stub(provider.AccessToken, 'find').resolves(accessToken);
  await koaOidcAuth(tenant)(ctx, next);

  return ctx.auth;
};

describe('koaOidcAuth middleware with an OIDC authentication context', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  beforeEach(() => {
    ctx.auth = {
      type: 'user',
      id: '',
      scopes: new Set(),
    };
    ctx.request = baseCtx.request;
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterEach(() => {
    Sinon.restore();
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it.each([LogtoAcr.FirstFactor, LogtoAcr.Mfa])(
    'should set identityVerified for a first-party token with a fresh %s context',
    async (acr) => {
      const auth = await runMiddleware(
        createTenantWithApplication({ isThirdParty: false }),
        buildAccessToken({ acr, auth_time: nowInSeconds() })
      );

      expect(auth).toMatchObject({ identityVerified: true, isFirstPartyClient: true });
    }
  );

  it.each([
    ['a stale authentication', { acr: LogtoAcr.FirstFactor, auth_time: nowInSeconds() - 601 }],
    ['a future authentication', { acr: LogtoAcr.FirstFactor, auth_time: nowInSeconds() + 3600 }],
    ['a missing `acr`', { auth_time: nowInSeconds() }],
    ['a malformed `acr`', { acr: 1, auth_time: nowInSeconds() }],
    ['a non-Logto `acr`', { acr: 'urn:example:acr:1fa', auth_time: nowInSeconds() }],
    ['a fractional `auth_time`', { acr: LogtoAcr.FirstFactor, auth_time: nowInSeconds() - 0.5 }],
    ['no authentication context', { some: 'claim' }],
    ['no extra at all', undefined],
  ])('should not set identityVerified with %s', async (_, extra) => {
    const auth = await runMiddleware(
      createTenantWithApplication({ isThirdParty: false }),
      buildAccessToken(extra)
    );

    expect(auth).toMatchObject({ identityVerified: false });
  });

  it.each([
    ['a third-party application', { isThirdParty: true }],
    ['an application that cannot be resolved', undefined],
  ])('should not set identityVerified for %s, even with a fresh MFA context', async (_, app) => {
    const auth = await runMiddleware(
      createTenantWithApplication(app),
      buildAccessToken({ acr: LogtoAcr.Mfa, auth_time: nowInSeconds() })
    );

    expect(auth).toMatchObject({ identityVerified: false, isFirstPartyClient: false });
  });

  it('should not set identityVerified for a CIMD client with a fresh MFA context', async () => {
    const auth = await runMiddleware(
      createTenantWithApplication({ isThirdParty: false }),
      buildAccessToken(
        { acr: LogtoAcr.Mfa, auth_time: nowInSeconds() },
        'https://client.example.com/metadata.json'
      )
    );

    expect(auth).toMatchObject({ identityVerified: false, isFirstPartyClient: false });
  });

  it('should keep the legacy verification record path working', async () => {
    const auth = await runMiddleware(
      createTenantWithApplication(
        { isThirdParty: false },
        {
          type: VerificationType.Password,
          identifier: {
            type: AdditionalIdentifier.UserId,
            value: mockAccessToken.accountId,
          },
          verified: true,
        }
      ),
      buildAccessToken({ some: 'claim' }),
      'verification-record-id'
    );

    expect(auth).toMatchObject({ identityVerified: true });
  });

  it('should not set identityVerified when dev features are disabled', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const auth = await runMiddleware(
      createTenantWithApplication({ isThirdParty: false }),
      buildAccessToken({ acr: LogtoAcr.Mfa, auth_time: nowInSeconds() })
    );

    expect(auth).toMatchObject({ identityVerified: false });
    expect(auth.isFirstPartyClient).toBeUndefined();
  });
});
