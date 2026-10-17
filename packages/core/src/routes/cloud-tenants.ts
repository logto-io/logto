import {
  adminTenantId,
  CloudScope,
  getCloudApiIndicator,
  PredefinedScope,
  TenantTag,
} from '@logto/schemas';
import type { Context, Next } from 'koa';
import { sql } from '@silverhand/slonik';
import Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { verifyBearerTokenFromRequest } from '#src/middleware/koa-auth/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { provisionTenant } from '#src/tenants/provision.js';
import assertThat from '#src/utils/assert-that.js';

// Cloud tenant API: list, read and create tenants on this instance. Served on the admin tenant's `/api`
// only when `IS_CLOUD` is set. A caller needs a token issued for the instance's own cloud API resource,
// `<admin endpoint>/api`, and the scope for the route.

type TenantRow = {
  id: string;
  name: string;
  tag: string;
  regionName: string | null;
  createdAt: string | number | Date;
};

const toTenantResponse = (row: TenantRow) => {
  const createdAt = new Date(row.createdAt).toISOString();

  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    indicator: `https://${row.id}.logto.app/api`,
    subscription: {
      status: 'active',
      planId: 'development',
      currentPeriodStart: createdAt,
      currentPeriodEnd: new Date(Date.parse(createdAt) + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isEnterprisePlan: false,
      quotaScope: 'dedicated',
    },
    usage: { activeUsers: 0, tokenUsage: 0, userTokenUsage: 0, m2mTokenUsage: 0 },
    quota: { mauLimit: null, tokenLimit: null },
    openInvoices: [],
    isSuspended: false,
    planId: 'development',
    regionName: row.regionName ?? 'local',
    createdAt,
  };
};

const createTenantBody = z.object({
  name: z.string().min(1).max(128),
  tag: z.nativeEnum(TenantTag),
  regionName: z.string().max(64).optional(),
});

export const cloudTenantRoutes = (envSet: EnvSet) => {
  const router = new Router();

  // Checks the bearer token against the instance's cloud API resource and the route's scope, and returns
  // the user it was issued to. Only a signed-in user can own a tenant, so a machine token is refused.
  const authenticate = async (ctx: Context, scope: CloudScope) => {
    const audience = getCloudApiIndicator(EnvSet.values.adminUrlSet.endpoint.origin);
    const { sub, clientId, scopes } = await verifyBearerTokenFromRequest(
      envSet,
      ctx.request,
      audience
    );

    assertThat(
      scopes.includes(PredefinedScope.All) || scopes.includes(scope),
      new RequestError({ code: 'auth.forbidden', status: 403 })
    );
    assertThat(sub !== clientId, new RequestError({ code: 'auth.forbidden', status: 403 }));

    return sub;
  };

  const authorize = (scope: CloudScope) => async (ctx: Context, next: Next) => {
    await authenticate(ctx, scope);

    return next();
  };

  router.get(
    '/api/tenants',
    authorize(CloudScope.ManageTenantSelf),
    koaGuard({ status: [200, 304, 401, 403] }),
    async (ctx, next) => {
      const pool = await EnvSet.sharedPool;

      const rows = await pool.any<TenantRow>(sql`
        select id, name, tag, region_name as "regionName", created_at as "createdAt"
        from tenants
        where id <> ${adminTenantId}
        order by created_at
      `);
      ctx.body = rows.map(toTenantResponse);

      return next();
    }
  );

  router.get(
    '/api/tenants/:tenantId',
    authorize(CloudScope.ManageTenantSelf),
    koaGuard({ status: [200, 304, 401, 403, 404] }),
    async (ctx, next) => {
      const pool = await EnvSet.sharedPool;

      const row = await pool.maybeOne<TenantRow>(sql`
        select id, name, tag, region_name as "regionName", created_at as "createdAt"
        from tenants
        where id = ${ctx.params.tenantId ?? ''} and id <> ${adminTenantId}
      `);
      assertThat(row, new RequestError({ code: 'entity.not_found', status: 404 }));
      ctx.body = toTenantResponse(row);

      return next();
    }
  );

  router.post(
    '/api/tenants',
    koaGuard({ body: createTenantBody, status: [201, 400, 401, 403] }),
    async (ctx, next) => {
      const userId = await authenticate(ctx, CloudScope.CreateTenant);
      const { name, tag, regionName } = ctx.guard.body;
      const pool = await EnvSet.sharedPool;
      const tenantId = await provisionTenant({ name, tag, regionName, creatorId: userId });
      const row = await pool.one<TenantRow>(sql`
        select id, name, tag, region_name as "regionName", created_at as "createdAt"
        from tenants
        where id = ${tenantId}
      `);
      ctx.status = 201;
      ctx.body = toTenantResponse(row);

      return next();
    }
  );

  return router;
};
