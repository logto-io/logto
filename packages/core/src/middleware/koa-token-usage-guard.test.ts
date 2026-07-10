import { adminTenantId, ReservedPlanId } from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import Koa from 'koa';
import mount from 'koa-mount';
import { type Provider } from 'oidc-provider';
import Sinon from 'sinon';
import request from 'supertest';

import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';
import { EnvSet } from '#src/env-set/index.js';
import { SubscriptionLibrary } from '#src/libraries/subscription.js';
import initOidc from '#src/oidc/init.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { type Subscription } from '#src/utils/subscription/types.js';

import koaErrorHandler from './koa-error-handler.js';
import koaI18next from './koa-i18next.js';

const tokenLimit = 10_000;

const stubIsCloud = (isCloud: boolean) => {
  Sinon.stub(EnvSet.values, 'isCloud').value(isCloud);
};

const buildSubscription = (planId: Subscription['planId']): Subscription => ({
  ...mockSubscriptionData,
  planId,
  quota: { ...mockSubscriptionData.quota, tokenLimit },
});

const buildTokenUsage = (totalUsage: number) => ({
  totalUsage,
  userTokenUsage: totalUsage,
  m2mTokenUsage: 0,
});

/**
 * Mount the provider the same way `Tenant` does, so that the guard is exercised through the
 * `/oidc` mount instead of being called directly. The mount is what rewrites `ctx.path` to the
 * mount-relative `/token` the guard matches on.
 */
const createRequester = (provider: Provider) => {
  const app = new Koa();

  app.use(koaI18next());
  app.use(koaErrorHandler());
  app.use(mount('/oidc', provider.app));

  return request(app.callback());
};

/**
 * Build a provider for the given tenant. `initOidc` reads `EnvSet.values.isCloud` when mounting
 * the token usage guard, so `isCloud` must be stubbed before calling this.
 */
const createProvider = (tenant: MockTenant, subscription = tenant.subscription) =>
  initOidc(
    subscription.tenantId,
    tenant.envSet,
    tenant.queries,
    tenant.libraries,
    tenant.logtoConfigs,
    subscription
  );

const createSubscriptionLibrary = (tenant: MockTenant, tenantId: string) =>
  new SubscriptionLibrary(
    tenantId,
    tenant.queries,
    tenant.cloudConnection,
    new TtlCache<string, string>(60_000)
  );

describe('koaTokenUsageGuard mounted on the OIDC provider', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('should reject token requests with 429 when the tenant has exceeded its token limit', async () => {
    stubIsCloud(true);
    const tenant = new MockTenant();

    Sinon.stub(tenant.subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Free)
    );
    Sinon.stub(tenant.subscription, 'getTenantTokenUsage').resolves(buildTokenUsage(tokenLimit));

    const response = await createRequester(createProvider(tenant)).post('/oidc/token');

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({ code: 'auth.exceed_token_limit' });
  });

  it('should let token requests through to the provider when the tenant is under its token limit', async () => {
    stubIsCloud(true);
    const tenant = new MockTenant();

    Sinon.stub(tenant.subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Free)
    );
    const getTenantTokenUsage = Sinon.stub(tenant.subscription, 'getTenantTokenUsage').resolves(
      buildTokenUsage(tokenLimit - 1)
    );

    const response = await createRequester(createProvider(tenant)).post('/oidc/token');

    expect(getTenantTokenUsage.calledOnce).toBe(true);
    // The request reached the token endpoint, which rejects it for missing credentials.
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'invalid_request' });
  });

  it('should not check token usage for the admin tenant', async () => {
    stubIsCloud(true);
    const tenant = new MockTenant();
    const subscription = createSubscriptionLibrary(tenant, adminTenantId);
    const getSubscriptionData = Sinon.stub(subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Free)
    );

    const response = await createRequester(createProvider(tenant, subscription)).post(
      '/oidc/token'
    );

    expect(getSubscriptionData.called).toBe(false);
    expect(response.status).toBe(400);
  });

  it('should not check token usage for paid plans', async () => {
    stubIsCloud(true);
    const tenant = new MockTenant();

    Sinon.stub(tenant.subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Pro)
    );
    const getTenantTokenUsage = Sinon.stub(tenant.subscription, 'getTenantTokenUsage').resolves(
      buildTokenUsage(tokenLimit)
    );

    const response = await createRequester(createProvider(tenant)).post('/oidc/token');

    expect(getTenantTokenUsage.called).toBe(false);
    expect(response.status).toBe(400);
  });

  it('should only guard the mount-relative token path', async () => {
    stubIsCloud(true);
    const tenant = new MockTenant();

    const getSubscriptionData = Sinon.stub(tenant.subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Free)
    );
    Sinon.stub(tenant.subscription, 'getTenantTokenUsage').resolves(buildTokenUsage(tokenLimit));

    const response = await createRequester(createProvider(tenant)).get(
      '/oidc/.well-known/openid-configuration'
    );

    expect(getSubscriptionData.called).toBe(false);
    expect(response.status).toBe(200);
  });

  it('should not mount the token usage guard outside of Cloud', async () => {
    stubIsCloud(false);
    const tenant = new MockTenant();
    const getSubscriptionData = Sinon.stub(tenant.subscription, 'getSubscriptionData').resolves(
      buildSubscription(ReservedPlanId.Free)
    );
    Sinon.stub(tenant.subscription, 'getTenantTokenUsage').resolves(buildTokenUsage(tokenLimit));

    const response = await createRequester(createProvider(tenant)).post('/oidc/token');

    expect(getSubscriptionData.called).toBe(false);
    expect(response.status).toBe(400);
  });
});
