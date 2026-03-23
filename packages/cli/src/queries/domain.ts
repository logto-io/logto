import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

type DomainRow = {
  id: string;
  tenantId: string;
  domain: string;
  status: string;
  errorMessage?: string;
  cloudflareData?: { id: string; status: string; ssl: { status: string } };
  createdAt: string;
  updatedAt: string;
};

export const findAllDomainsAcrossTenants = async (pool: CommonQueryMethods) =>
  pool.any<DomainRow>(sql`
    select id, tenant_id as "tenantId", domain, status, error_message as "errorMessage",
      cloudflare_data as "cloudflareData", created_at as "createdAt", updated_at as "updatedAt"
    from domains
    order by created_at
  `);

type UpdateDomainStatusParams = {
  pool: CommonQueryMethods;
  id: string;
  status: string;
  errorMessage: string;
  cloudflareData: unknown;
};

export const updateDomainStatusById = async ({
  pool,
  id,
  status,
  errorMessage,
  cloudflareData,
}: UpdateDomainStatusParams) =>
  pool.query(sql`
    update domains
    set status = ${status},
      error_message = ${errorMessage},
      cloudflare_data = ${JSON.stringify(cloudflareData)},
      updated_at = now()
    where id = ${id}
  `);

export const deleteDomainById = async (pool: CommonQueryMethods, id: string) =>
  pool.query(sql`
    delete from domains where id = ${id}
  `);
