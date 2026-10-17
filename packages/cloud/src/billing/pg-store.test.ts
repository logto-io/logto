import { createPool, sql } from '@silverhand/slonik';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPgBillingStore } from './pg-store.js';
import { migrateBillingSchema } from './schema.js';

// Runs against the scratch `meshx_cloud_test` database. Skipped when no URL is set, so unit runs
// on machines without Postgres still pass.
const databaseUrl = process.env.BILLING_TEST_DATABASE_URL;

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

describe.skipIf(!databaseUrl)('createPgBillingStore', () => {
  const tenantId = 'billingtenant001';

  beforeAll(async () => {
    const pool = await createPool(databaseUrl!);
    await migrateBillingSchema(pool);
    await pool.query(sql`delete from billing_subscriptions where tenant_id = ${tenantId}`);
    await pool.query(sql`
      insert into billing_subscriptions (
        tenant_id, plan_id, status, is_enterprise_plan, is_dev_plan, has_billing_customer,
        current_period_start, current_period_end, quota, system_limit
      ) values (
        ${tenantId}, 'pro', 'active', false, false, true,
        '2026-10-01T00:00:00Z', '2026-11-01T00:00:00Z',
        ${sql.jsonb(quota)}, ${sql.jsonb({ applicationsLimit: 100 })}
      )
    `);
    await pool.end();
  });

  afterAll(async () => {
    const pool = await createPool(databaseUrl!);
    await pool.query(sql`delete from billing_subscriptions where tenant_id = ${tenantId}`);
    await pool.end();
  });

  it('returns the subscription for a tenant in the camelCase contract', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);

    await expect(store.findSubscription(tenantId)).resolves.toEqual({
      planId: 'pro',
      status: 'active',
      isEnterprisePlan: false,
      isDevPlan: false,
      hasBillingCustomer: true,
      currentPeriodStart: '2026-10-01T00:00:00.000Z',
      currentPeriodEnd: '2026-11-01T00:00:00.000Z',
      quota,
      systemLimit: { applicationsLimit: 100 },
    });

    await pool.end();
  });

  it('lists SKUs in the camelCase contract and filters by type', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);

    await pool.query(sql`delete from billing_skus where id = 'test-addon-sku'`);
    await pool.query(sql`
      insert into billing_skus (id, type, name, stripe_product_id, default_price_id, unit_price, quota)
      values ('test-addon-sku', 'AddOn', 'Test add-on', null, 'price_test_addon', 12.5,
        ${sql.jsonb({ hooksLimit: 10 })})
    `);

    const addOns = await store.listSkus({ type: 'AddOn' });

    expect(addOns).toEqual([
      expect.objectContaining({
        id: 'test-addon-sku',
        type: 'AddOn',
        name: 'Test add-on',
        defaultPriceId: 'price_test_addon',
        unitPrice: 12.5,
        quota: { hooksLimit: 10 },
      }),
    ]);
    await expect(store.listSkus({ type: 'Basic' })).resolves.not.toContainEqual(
      expect.objectContaining({ id: 'test-addon-sku' })
    );

    await pool.query(sql`delete from billing_skus where id = 'test-addon-sku'`);
    await pool.end();
  });

  it('lists a tenant invoices in the camelCase contract', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);

    await pool.query(sql`delete from billing_invoices where id = 'test-invoice-pg'`);
    await pool.query(sql`
      insert into billing_invoices (
        id, tenant_id, status, basic_sku_id, billing_reason, amount_due, amount_paid,
        period_start, period_end, plan_name, collection_method
      ) values (
        'test-invoice-pg', ${tenantId}, 'paid', 'foundation', 'subscription_cycle', 4900, 4900,
        '2026-10-01T00:00:00Z', '2026-11-01T00:00:00Z', 'Foundation', 'charge_automatically'
      )
    `);

    const invoices = await store.listInvoices(tenantId);

    expect(invoices).toEqual([
      expect.objectContaining({
        id: 'test-invoice-pg',
        status: 'paid',
        basicSkuId: 'foundation',
        amountDue: 4900,
        amountPaid: 4900,
        periodStart: new Date('2026-10-01T00:00:00Z'),
        planName: 'Foundation',
        collectionMethod: 'charge_automatically',
      }),
    ]);

    await pool.query(sql`delete from billing_invoices where id = 'test-invoice-pg'`);
    await pool.end();
  });

  it('finds a membership role by tenant and caller identity', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);
    const identity = { issuer: 'https://auth.example.test/oidc', sub: 'pg-member-1' };

    await pool.query(
      sql`delete from tenant_members where tenant_id = ${tenantId} and member_sub = ${identity.sub}`
    );
    await pool.query(sql`
      insert into tenant_members (tenant_id, member_issuer, member_sub, role)
      values (${tenantId}, ${identity.issuer}, ${identity.sub}, 'admin')
    `);

    await expect(store.findMembership(tenantId, identity)).resolves.toBe('admin');
    await expect(
      store.findMembership(tenantId, { ...identity, issuer: 'https://other.example.test' })
    ).resolves.toBeNull();
    await expect(store.findMembership('nosuchtenant0001', identity)).resolves.toBeNull();

    await pool.query(
      sql`delete from tenant_members where tenant_id = ${tenantId} and member_sub = ${identity.sub}`
    );
    await pool.end();
  });

  it('creates, lists, finds, and updates invitations', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);
    const record = {
      id: 'test-invitation-pg',
      tenantId,
      invitee: 'pg-invitee@example.test',
      inviterSub: 'pg-admin-1',
      tokenHash: 'hash-of-a-token',
      status: 'pending' as const,
      createdAt: new Date('2026-10-01T00:00:00Z'),
      expiresAt: new Date('2026-10-08T00:00:00Z'),
    };

    await pool.query(sql`delete from tenant_invitations where id = ${record.id}`);
    await store.createInvitation(record);

    await expect(store.findInvitation(record.id)).resolves.toMatchObject({
      tenantId,
      invitee: record.invitee,
      tokenHash: record.tokenHash,
      status: 'pending',
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    });
    await expect(store.listInvitations(tenantId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: record.id })])
    );

    await store.setInvitationStatus(record.id, 'accepted');

    await expect(store.findInvitation(record.id)).resolves.toMatchObject({ status: 'accepted' });

    await pool.query(sql`delete from tenant_invitations where id = ${record.id}`);
    await pool.end();
  });

  it('returns null for a tenant without a subscription', async () => {
    const pool = await createPool(databaseUrl!);
    const store = createPgBillingStore(pool);

    await expect(store.findSubscription('nosuchtenant0001')).resolves.toBeNull();

    await pool.end();
  });
});
