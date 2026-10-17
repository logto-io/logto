import createServer, { compose, withBody, withRequest } from '@withtyped/server';
import { generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type OperatorAuthConfig } from './auth.js';
import { createBillingRouter } from './router.js';
import { createInMemoryBillingStore } from './store.js';
import { type Subscription } from './subscription.js';

const issuer = 'https://auth.example.test/oidc';
const audience = 'https://billing.example.test';
const operatorSub = 'operator-user-1';
const tenantAdminSub = 'tenant-admin-user-1';
const tenantId = 'tenant0000000000001';

const quota = {
  mauLimit: 1000,
  applicationsLimit: null,
  thirdPartyApplicationsLimit: 5,
  scopesPerResourceLimit: 10,
  socialConnectorsLimit: null,
  userRolesLimit: 10,
  machineToMachineRolesLimit: 10,
  scopesPerRoleLimit: 10,
  hooksLimit: 3,
  auditLogsRetentionDays: 30,
  customJwtEnabled: false,
  actionsEnabled: false,
  subjectTokenEnabled: false,
  bringYourUiEnabled: false,
  collectUserProfileEnabled: false,
  passkeySignInEnabled: true,
  tokenLimit: null,
  hostedEmailLimit: 100,
  hostedEmailDailyLimit: 10,
  machineToMachineLimit: 1,
  resourcesLimit: 3,
  enterpriseSsoLimit: 0,
  consoleSsoConnectorLimit: 0,
  tenantMembersLimit: 3,
  mfaEnabled: true,
  organizationsEnabled: false,
  organizationsLimit: 0,
  idpInitiatedSsoEnabled: false,
  samlApplicationsLimit: 0,
  securityFeaturesEnabled: false,
  customDomainsLimit: 0,
};

const subscription: Subscription = {
  planId: 'pro',
  currentPeriodStart: '2026-10-01T00:00:00.000Z',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  isEnterprisePlan: false,
  status: 'active',
  quota,
  systemLimit: {},
};

const invoice = {
  id: 'in_test_0001',
  status: 'paid' as const,
  subscriptionId: null,
  customerId: null,
  basicSkuId: 'foundation',
  skuId: null,
  billingReason: 'subscription_cycle',
  amountDue: 4900,
  amountPaid: 4900,
  periodStart: new Date('2026-10-01T00:00:00.000Z'),
  periodEnd: new Date('2026-11-01T00:00:00.000Z'),
  servicePeriodStart: null,
  servicePeriodEnd: null,
  dueDate: null,
  planName: 'Foundation',
  hostedInvoiceUrl: null,
  invoicePdf: null,
  collectionMethod: 'charge_automatically' as const,
  createdAt: new Date('2026-10-01T00:00:00.000Z'),
  updatedAt: new Date('2026-10-01T00:00:00.000Z'),
};

const foundationSku = {
  type: 'Basic' as const,
  id: 'foundation',
  createdAt: new Date('2026-10-01T00:00:00.000Z'),
  updatedAt: new Date('2026-10-01T00:00:00.000Z'),
  name: 'Foundation',
  defaultPriceId: 'price_test_foundation',
  unitPrice: null,
  quota: {},
};

describe('billing router over HTTP', () => {
  let privateKey: CryptoKey;
  let publicKey: CryptoKey;
  let router: ReturnType<typeof createBillingRouter>;
  let baseUrl = '';
  let close: () => Promise<void> = async () => {};

  const auth = (): OperatorAuthConfig => ({
    issuer,
    audience,
    getKey: async () => publicKey,
    operators: [{ issuer, sub: operatorSub }],
  });

  const tokenFor = async (sub: string) =>
    new SignJWT({})
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256');
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;

    const store = createInMemoryBillingStore({
      subscriptions: { [tenantId]: subscription },
      skus: [foundationSku],
      invoices: { [tenantId]: [invoice] },
    });
    const router = createBillingRouter(store, auth());

    const port = 19_431;
    const server = createServer({
      port,
      logLevel: 'none',
      composer: compose(withRequest()).and(withBody()).and(router.routes()),
    });

    baseUrl = `http://127.0.0.1:${port}`;
    await server.listen();
    close = server.close;
  });

  afterAll(async () => {
    await close();
  });

  it('returns 401 when no token is sent', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/subscription`);

    expect(response.status).toBe(401);
  });

  it('returns 403 for a tenant admin, even for their own tenant', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/subscription`, {
      headers: { authorization: `Bearer ${await tokenFor(tenantAdminSub)}` },
    });

    expect(response.status).toBe(403);
  });

  it('returns the subscription for an operator', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/subscription`, {
      headers: { authorization: `Bearer ${await tokenFor(operatorSub)}` },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ planId: 'pro', status: 'active' });
  });

  it('returns 401 for invoices when no token is sent', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invoices`);

    expect(response.status).toBe(401);
  });

  it('returns 403 for invoices to a tenant admin', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invoices`, {
      headers: { authorization: `Bearer ${await tokenFor(tenantAdminSub)}` },
    });

    expect(response.status).toBe(403);
  });

  it('returns the tenant invoices to an operator', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invoices`, {
      headers: { authorization: `Bearer ${await tokenFor(operatorSub)}` },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      invoices: [{ id: 'in_test_0001', status: 'paid', amountPaid: 4900 }],
    });
  });

  it('returns an empty invoice list for a tenant with no invoices', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/unknowntenant00001/invoices`, {
      headers: { authorization: `Bearer ${await tokenFor(operatorSub)}` },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ invoices: [] });
  });

  it('serves the SKU catalogue without a token', async () => {
    const response = await fetch(`${baseUrl}/api/skus`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([{ id: 'foundation', type: 'Basic' }]);
  });

  it('filters the SKU catalogue by type', async () => {
    const response = await fetch(`${baseUrl}/api/skus?type=AddOn`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });

  it('rejects an unknown SKU type with 400', async () => {
    const response = await fetch(`${baseUrl}/api/skus?type=Enterprise`);

    expect(response.status).toBe(400);
  });

  it('returns 404 when the operator asks for a tenant without a subscription', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/unknowntenant00001/subscription`, {
      headers: { authorization: `Bearer ${await tokenFor(operatorSub)}` },
    });

    expect(response.status).toBe(404);
  });
});
