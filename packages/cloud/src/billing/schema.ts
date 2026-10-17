import { type CommonQueryMethods, sql } from '@silverhand/slonik';

/**
 * Billing tables in the `meshx_cloud` database. Billing is platform data read across every
 * customer by the operator backoffice, so these tables have no tenant row-level security; access
 * is granted to the cloud service's database role only.
 *
 * `quota` and `system_limit` on a subscription are snapshots taken when the subscription changes,
 * so a read returns the entitlements the customer bought without joining the SKU catalogue.
 */
export const billingSchemaSql = sql`
  create table if not exists billing_skus (
    id varchar(64) not null,
    type varchar(32) not null,
    name text,
    stripe_product_id text,
    default_price_id text,
    unit_price numeric,
    quota jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id)
  );

  alter table billing_skus add column if not exists stripe_product_id text;

  create table if not exists billing_subscriptions (
    tenant_id varchar(21) not null,
    plan_id varchar(64) not null,
    status varchar(32) not null,
    is_enterprise_plan boolean not null default false,
    is_dev_plan boolean not null default false,
    has_billing_customer boolean not null default false,
    current_period_start timestamptz not null,
    current_period_end timestamptz not null,
    quota jsonb not null default '{}'::jsonb,
    system_limit jsonb not null default '{}'::jsonb,
    primary key (tenant_id)
  );

  create table if not exists billing_invoices (
    id varchar(64) not null,
    tenant_id varchar(21) not null,
    subscription_id varchar(64),
    customer_id varchar(64),
    basic_sku_id varchar(64),
    sku_id varchar(64),
    status varchar(32),
    billing_reason varchar(64),
    amount_due integer not null default 0,
    amount_paid integer not null default 0,
    period_start timestamptz not null,
    period_end timestamptz not null,
    service_period_start timestamptz,
    service_period_end timestamptz,
    due_date timestamptz,
    plan_name text,
    hosted_invoice_url text,
    invoice_pdf text,
    collection_method varchar(32),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id)
  );

  create index if not exists billing_invoices_tenant_id on billing_invoices (tenant_id);

  create table if not exists tenant_members (
    tenant_id varchar(21) not null,
    member_issuer text not null,
    member_sub text not null,
    role varchar(32) not null,
    created_at timestamptz not null default now(),
    primary key (tenant_id, member_issuer, member_sub)
  );

  create table if not exists tenant_invitations (
    id varchar(64) not null,
    tenant_id varchar(21) not null,
    invitee text not null,
    inviter_sub text not null,
    token_hash text not null,
    status varchar(16) not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    primary key (id)
  );

  create index if not exists tenant_invitations_tenant_id on tenant_invitations (tenant_id);
`;

export const migrateBillingSchema = async (pool: CommonQueryMethods) => {
  await pool.query(billingSchemaSql);
};
