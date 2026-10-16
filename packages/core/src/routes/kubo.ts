import { array, boolean, object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, ManagementApiRouterContext, RouterInitArgs } from './types.js';

// Proxy to the Kubo operator portal running in the same cluster.
// Mounted on the management API router, so Logto's admin auth applies.
const defaultKuboPortalUrl = 'http://kubo-portal.kubo-system.svc.cluster.local:9090';
const maxResponseBytes = 5 * 1024 * 1024;

// Kubernetes DNS label: lowercase letters, digits, and dashes, up to 63 characters.
const kubeName = /^[\da-z]([\da-z-]{0,61}[\da-z])?$/;

const createStackBody = object({
  template: string(),
  tenant: string(),
  mode: string().optional(),
  exclude: array(string()).optional(),
  operators: object({}).catchall(boolean()).optional(),
  bootstrapM2M: boolean().optional(),
});

const upstreamError = (ctx: ManagementApiRouterContext, message: string) => {
  ctx.status = 502;
  ctx.body = { code: 'kubo.upstream_error', message };
};

type KshowsNode = { name: string; hourlyUSD?: number; instanceType?: string };

// Azure list prices per VM size, cached so the capacity poll does not hit the
// retail API every time. Prices change rarely, so six hours is plenty.
const azurePriceTtlMs = 6 * 60 * 60 * 1000;
const azurePriceCache = new Map<string, { usd: number; at: number }>();

const azureRegion = () => process.env.KUBO_COST_AZURE_REGION ?? 'uaenorth';

/** Linux pay-as-you-go hourly price for a VM size, or undefined when Azure has no match. */
const azureHourlyUsd = async (sku: string): Promise<number | undefined> => {
  const cached = azurePriceCache.get(sku);
  if (cached && Date.now() - cached.at < azurePriceTtlMs) {
    return cached.usd;
  }
  const filter = `serviceName eq 'Virtual Machines' and armSkuName eq '${sku}' and armRegionName eq '${azureRegion()}' and priceType eq 'Consumption'`;
  const url = new URL('https://prices.azure.com/api/retail/prices');
  url.searchParams.set('$filter', filter);
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    return undefined;
  }
  const body = (await response.json()) as { Items?: Array<{ retailPrice: number; productName: string; meterName: string }> };
  const item = (body.Items ?? []).find(
    ({ productName, meterName }) =>
      !productName.includes('Windows') && !meterName.includes('Spot') && !meterName.includes('Low Priority')
  );
  if (!item) {
    return undefined;
  }
  azurePriceCache.set(sku, { usd: item.retailPrice, at: Date.now() });
  return item.retailPrice;
};

/** Prices each node from its Azure VM size; nodes without a match keep the portal's rate. */
const priceKshowsNodes = async (snapshot: { nodes?: KshowsNode[] }) => {
  const nodes = await Promise.all(
    (snapshot.nodes ?? []).map(async (node) => {
      if (!node.instanceType) {
        return node;
      }
      const usd = await azureHourlyUsd(node.instanceType).catch(() => undefined);
      return usd === undefined ? node : { ...node, hourlyUSD: usd };
    })
  );
  return { ...snapshot, nodes };
};

const forward = async (ctx: ManagementApiRouterContext, path: string) => {
  const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
  const response = await fetch(new URL(path, baseUrl), {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    upstreamError(ctx, `Kubo portal returned ${response.status}`);
    return;
  }

  // Reject oversized responses early when the upstream declares a length.
  // Chunked responses without content-length are still fully read before the check below.
  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength > maxResponseBytes) {
    upstreamError(ctx, 'Kubo portal response too large');
    return;
  }

  const text = await response.text();
  if (text.length > maxResponseBytes) {
    upstreamError(ctx, 'Kubo portal response too large');
    return;
  }

  ctx.body = JSON.parse(text);
};

export default function kuboRoutes<T extends ManagementApiRouter>(...[router]: RouterInitArgs<T>) {
  router.get('/kubo/stacks', async (ctx, next) => {
    await forward(ctx, '/api/stacks');
    return next();
  });

  router.get('/kubo/cluster/economics', async (ctx, next) => {
    await forward(ctx, '/api/cluster/economics');
    return next();
  });

  router.get('/kubo/demorequests', async (ctx, next) => {
    await forward(ctx, '/api/demorequests');
    return next();
  });

  // Air-gapped bundle upload. The raw tar body is streamed to Kubo without buffering,
  // because bundles can be several GB.
  router.post('/kubo/airgap/bundle', async (ctx, next) => {
    const name = typeof ctx.query.name === 'string' ? ctx.query.name : '';
    if (!/^[\da-z][\da-z-]{0,62}$/.test(name)) {
      ctx.status = 400;
      ctx.body = { code: 'kubo.invalid_name', message: 'Name must be a lowercase label' };
      return next();
    }

    const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
    const url = new URL('/api/airgap/bundle', baseUrl);
    url.searchParams.set('name', name);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-tar' },
      body: ctx.req as unknown as BodyInit,
      duplex: 'half',
      signal: AbortSignal.timeout(60 * 60 * 1000),
    } as RequestInit);

    ctx.status = response.status;
    ctx.body = { message: await response.text() };
    return next();
  });

  router.get('/kubo/templates', async (ctx, next) => {
    await forward(ctx, '/api/templates');
    return next();
  });

  // Capacity map: node and pod usage snapshot (polled by the console).
  router.get('/kubo/kshows', async (ctx, next) => {
    await forward(ctx, '/api/kshows/snapshot');
    if (ctx.body && typeof ctx.body === 'object') {
      ctx.body = await priceKshowsNodes(ctx.body as { nodes?: KshowsNode[] });
    }
    return next();
  });

  // Stack detail with component-level status.
  router.get('/kubo/stacks/:namespace/:name', async (ctx, next) => {
    const namespace = ctx.params.namespace ?? '';
    const name = ctx.params.name ?? '';
    if (!kubeName.test(namespace) || !kubeName.test(name)) {
      ctx.status = 400;
      ctx.body = { code: 'kubo.invalid_name', message: 'Invalid stack name' };
      return next();
    }
    await forward(ctx, `/api/stacks/${namespace}/${name}`);
    return next();
  });

  // Partial update of a stack's spec: mode, bundle, exclusions, operators, feature flags,
  // image tags, chart versions and component values. The portal applies it as a merge patch.
  const patchFields = ['mode', 'bundle', 'exclude', 'operators', 'componentValues', 'featureFlags', 'imageTags', 'chartVersions'];
  router.patch(
    '/kubo/stacks/:namespace/:name',
    koaGuard({ body: object({}).passthrough(), status: [200, 400, 502] }),
    async (ctx, next) => {
    const namespace = ctx.params.namespace ?? '';
    const name = ctx.params.name ?? '';
    if (!kubeName.test(namespace) || !kubeName.test(name)) {
      ctx.status = 400;
      ctx.body = { code: 'kubo.invalid_name', message: 'Invalid stack name' };
      return next();
    }

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const unknown = Object.keys(body).filter((key) => !patchFields.includes(key));
    if (unknown.length > 0) {
      ctx.status = 400;
      ctx.body = { code: 'kubo.invalid_field', message: `Unsupported fields: ${unknown.join(', ')}` };
      return next();
    }

    const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
    const response = await fetch(new URL(`/api/stacks/${namespace}/${name}`, baseUrl), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const text = await response.text();
    if (!response.ok) {
      upstreamError(ctx, text.slice(0, 500) || `Kubo portal returned ${response.status}`);
      return next();
    }

    ctx.body = JSON.parse(text);
    return next();
  });

  // Trigger the stack's bootstrap job. Returns the created job name.
  router.post('/kubo/stacks/:namespace/:name/bootstrap', async (ctx, next) => {
    const namespace = ctx.params.namespace ?? '';
    const name = ctx.params.name ?? '';
    if (!kubeName.test(namespace) || !kubeName.test(name)) {
      ctx.status = 400;
      ctx.body = { code: 'kubo.invalid_name', message: 'Invalid stack name' };
      return next();
    }

    const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
    const response = await fetch(new URL(`/api/stacks/${namespace}/${name}/bootstrap`, baseUrl), {
      method: 'POST',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      upstreamError(ctx, `Kubo portal returned ${response.status}`);
      return next();
    }

    ctx.body = JSON.parse(await response.text());
    return next();
  });

  // Agent framework read-only views (aggregated across stack namespaces by the portal).
  for (const view of ['products', 'stats', 'sessions', 'requests'] as const) {
    router.get(`/kubo/agentfw/${view}`, async (ctx, next) => {
      const query = new URLSearchParams(ctx.querystring);
      await forward(ctx, `/agentfw/api/v1/${view}?${query.toString()}`);
      return next();
    });
  }

  // Rendered YAML for a template, shown to the user before anything is created.
  // The upstream returns YAML text, so it is wrapped as JSON for the console.
  router.get('/kubo/template', async (ctx, next) => {
    const query = new URLSearchParams(ctx.querystring);
    const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
    const response = await fetch(new URL(`/api/template?${query.toString()}`, baseUrl), {
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      upstreamError(ctx, `Kubo portal returned ${response.status}`);
      return next();
    }

    ctx.body = { yaml: await response.text() };
    return next();
  });

  router.post(
    '/kubo/stacks',
    koaGuard({ body: createStackBody, status: [200, 201, 502] }),
    async (ctx, next) => {
      const baseUrl = process.env.KUBO_PORTAL_URL ?? defaultKuboPortalUrl;
      const response = await fetch(new URL('/api/stacks', baseUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(ctx.guard.body),
        signal: AbortSignal.timeout(30_000),
      });

      const text = await response.text();
      if (!response.ok) {
        upstreamError(ctx, text.slice(0, 500) || `Kubo portal returned ${response.status}`);
        return next();
      }

      ctx.status = response.status;
      ctx.body = JSON.parse(text);
      return next();
    }
  );
}
