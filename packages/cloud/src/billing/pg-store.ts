import { type CommonQueryMethods, sql } from '@silverhand/slonik';
import { z } from 'zod';

import { invoiceGuard, type Invoice } from './invoice.js';
import { type InvitationRecord, invitationStatusGuard } from './invitation.js';

const invitationRow = z.object({
  id: z.string(),
  tenant_id: z.string(),
  invitee: z.string(),
  inviter_sub: z.string(),
  token_hash: z.string(),
  status: invitationStatusGuard,
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

const toInvitationRecord = (row: z.infer<typeof invitationRow>): InvitationRecord => ({
  id: row.id,
  tenantId: row.tenant_id,
  invitee: row.invitee,
  inviterSub: row.inviter_sub,
  tokenHash: row.token_hash,
  status: row.status,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
});
import { skuGuard, type Sku, type SkuType } from './sku.js';

const invoiceRow = z.object({
  id: z.string(),
  status: z.string().nullable(),
  subscription_id: z.string().nullable(),
  customer_id: z.string().nullable(),
  basic_sku_id: z.string().nullable(),
  sku_id: z.string().nullable(),
  billing_reason: z.string().nullable(),
  amount_due: z.number(),
  amount_paid: z.number(),
  period_start: z.coerce.date(),
  period_end: z.coerce.date(),
  service_period_start: z.coerce.date().nullable(),
  service_period_end: z.coerce.date().nullable(),
  due_date: z.coerce.date().nullable(),
  plan_name: z.string().nullable(),
  hosted_invoice_url: z.string().nullable(),
  invoice_pdf: z.string().nullable(),
  collection_method: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
import { type BillingStore, type TenantRole } from './store.js';
import { subscriptionGuard, type Subscription } from './subscription.js';

const skuRow = z.object({
  type: z.string(),
  id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  name: z.string().nullable(),
  default_price_id: z.string().nullable(),
  unit_price: z.union([z.number(), z.string()]).nullable(),
  quota: z.record(z.unknown()),
});

const subscriptionRow = z.object({
  plan_id: z.string(),
  status: z.string(),
  is_enterprise_plan: z.boolean(),
  is_dev_plan: z.boolean(),
  has_billing_customer: z.boolean(),
  // Slonik returns `timestamptz` as epoch milliseconds, so coerce rather than expect a `Date`.
  current_period_start: z.coerce.date(),
  current_period_end: z.coerce.date(),
  quota: z.record(z.unknown()),
  system_limit: z.record(z.unknown()),
});

/**
 * Reads billing data from the `meshx_cloud` database. Rows are parsed with the same guards the
 * routes respond with, so a row that drifts from the contract fails here instead of reaching a
 * customer's console.
 */
export const createPgBillingStore = (pool: CommonQueryMethods): BillingStore => ({
  findSubscription: async (tenantId): Promise<Subscription | null> => {
    const row = await pool.maybeOne(sql`
      select plan_id, status, is_enterprise_plan, is_dev_plan, has_billing_customer,
        current_period_start, current_period_end, quota, system_limit
      from billing_subscriptions
      where tenant_id = ${tenantId}
    `);

    if (!row) {
      return null;
    }

    const parsed = subscriptionRow.parse(row);

    return subscriptionGuard.parse({
      planId: parsed.plan_id,
      status: parsed.status,
      isEnterprisePlan: parsed.is_enterprise_plan,
      isDevPlan: parsed.is_dev_plan,
      hasBillingCustomer: parsed.has_billing_customer,
      currentPeriodStart: parsed.current_period_start.toISOString(),
      currentPeriodEnd: parsed.current_period_end.toISOString(),
      quota: parsed.quota,
      systemLimit: parsed.system_limit,
    });
  },
  listSkus: async ({ type }): Promise<Sku[]> => {
    const rows = await pool.any(sql`
      select type, id, created_at, updated_at, name, default_price_id, unit_price, quota
      from billing_skus
      where ${type ?? null}::varchar is null or type = ${type ?? null}::varchar
      order by id
    `);

    return rows.map((row) => {
      const parsed = skuRow.parse(row);

      return skuGuard.parse({
        type: parsed.type as SkuType,
        id: parsed.id,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
        name: parsed.name,
        defaultPriceId: parsed.default_price_id,
        // Postgres `numeric` comes back as a string, so normalise it before the guard.
        unitPrice: parsed.unit_price === null ? null : Number(parsed.unit_price),
        quota: parsed.quota,
      });
    });
  },
  listInvoices: async (tenantId): Promise<Invoice[]> => {
    const rows = await pool.any(sql`
      select id, status, subscription_id, customer_id, basic_sku_id, sku_id, billing_reason,
        amount_due, amount_paid, period_start, period_end, service_period_start,
        service_period_end, due_date, plan_name, hosted_invoice_url, invoice_pdf,
        collection_method, created_at, updated_at
      from billing_invoices
      where tenant_id = ${tenantId}
      order by period_start desc, id desc
    `);

    return rows.map((row) => {
      const parsed = invoiceRow.parse(row);

      return invoiceGuard.parse({
        id: parsed.id,
        status: parsed.status,
        subscriptionId: parsed.subscription_id,
        customerId: parsed.customer_id,
        basicSkuId: parsed.basic_sku_id,
        skuId: parsed.sku_id,
        billingReason: parsed.billing_reason,
        amountDue: parsed.amount_due,
        amountPaid: parsed.amount_paid,
        periodStart: parsed.period_start,
        periodEnd: parsed.period_end,
        servicePeriodStart: parsed.service_period_start,
        servicePeriodEnd: parsed.service_period_end,
        dueDate: parsed.due_date,
        planName: parsed.plan_name,
        hostedInvoiceUrl: parsed.hosted_invoice_url,
        invoicePdf: parsed.invoice_pdf,
        collectionMethod: parsed.collection_method,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
      });
    });
  },
  findMembership: async (tenantId, identity): Promise<TenantRole | null> => {
    const row = await pool.maybeOne(sql`
      select role from tenant_members
      where tenant_id = ${tenantId}
        and member_issuer = ${identity.issuer}
        and member_sub = ${identity.sub}
    `);

    if (!row) {
      return null;
    }

    return z.enum(['admin', 'member']).parse(row.role);
  },
  listInvitations: async (tenantId): Promise<InvitationRecord[]> => {
    const rows = await pool.any(sql`
      select id, tenant_id, invitee, inviter_sub, token_hash, status, created_at, expires_at
      from tenant_invitations
      where tenant_id = ${tenantId}
      order by created_at desc, id desc
    `);

    return rows.map((row) => toInvitationRecord(invitationRow.parse(row)));
  },
  findInvitation: async (id): Promise<InvitationRecord | null> => {
    const row = await pool.maybeOne(sql`
      select id, tenant_id, invitee, inviter_sub, token_hash, status, created_at, expires_at
      from tenant_invitations
      where id = ${id}
    `);

    return row ? toInvitationRecord(invitationRow.parse(row)) : null;
  },
  createInvitation: async (record): Promise<void> => {
    await pool.query(sql`
      insert into tenant_invitations (
        id, tenant_id, invitee, inviter_sub, token_hash, status, created_at, expires_at
      ) values (
        ${record.id}, ${record.tenantId}, ${record.invitee}, ${record.inviterSub},
        ${record.tokenHash}, ${record.status}, ${record.createdAt.toISOString()},
        ${record.expiresAt.toISOString()}
      )
    `);
  },
  setInvitationStatus: async (id, status): Promise<void> => {
    await pool.query(sql`
      update tenant_invitations set status = ${status} where id = ${id}
    `);
  },
});
