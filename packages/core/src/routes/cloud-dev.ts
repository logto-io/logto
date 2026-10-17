import { ReservedPlanId, TenantScope } from '@logto/schemas';
import { text } from 'node:stream/consumers';
import type { Context, Next } from 'koa';
import proxy from 'koa-proxies';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

// Local stand-in for the Cloud API, for running the admin console in cloud mode (`IS_CLOUD`) on a
// single Logto instance. The console calls these routes on its own origin. They return the same
// defaults the OSS console uses, without checking tokens, so they are served only when the instance
// is cloud and not production. Production cloud serves its own API and never reaches this code.

const tenantId = 'default';
const developmentPlanId = 'development';

/** Local tenant state. A local checkout moves the tenant to production; it resets on restart. */
const localState: { tag: string; planId: string; sessions: Record<string, { tenantId: string; skuId: string }> } = {
  tag: 'development',
  planId: developmentPlanId,
  sessions: {},
};

const now = () => new Date().toISOString();

const tenant = () => {
  const created = now();

  return {
    id: tenantId,
    name: `tenant_${tenantId}`,
    tag: localState.tag,
    indicator: `https://${tenantId}.logto.app/api`,
    subscription: {
      status: 'active',
      planId: localState.planId,
      currentPeriodStart: created,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isEnterprisePlan: false,
      quotaScope: 'dedicated',
    },
    usage: { activeUsers: 0, tokenUsage: 0, userTokenUsage: 0, m2mTokenUsage: 0 },
    quota: { mauLimit: null, tokenLimit: null },
    openInvoices: [],
    isSuspended: false,
    planId: localState.planId,
    regionName: 'local',
    createdAt: created,
  };
};

const proSku = () => ({ ...sku(), id: ReservedPlanId.Pro202509, name: 'Logto Pro plan', isDefault: false, isDevPlan: false });

const sku = () => {
  const created = now();

  return {
    id: developmentPlanId,
    name: 'Logto Development plan',
    createdAt: created,
    updatedAt: created,
    type: 'basic',
    unitPrice: 0,
    productId: null,
    defaultPriceId: null,
    isDefault: true,
    isDevPlan: true,
    quota: {
      mauLimit: 100,
      tokenLimit: null,
      applicationsLimit: null,
      machineToMachineLimit: null,
      resourcesLimit: null,
      scopesPerResourceLimit: null,
      socialConnectorsLimit: null,
      userRolesLimit: null,
      machineToMachineRolesLimit: null,
      scopesPerRoleLimit: null,
      hooksLimit: null,
      auditLogsRetentionDays: 14,
      mfaEnabled: true,
      organizationsLimit: null,
      enterpriseSsoLimit: null,
      consoleSsoConnectorLimit: 0,
      thirdPartyApplicationsLimit: null,
      tenantMembersLimit: 20,
      customJwtEnabled: true,
      actionsEnabled: false,
      subjectTokenEnabled: true,
      bringYourUiEnabled: true,
      collectUserProfileEnabled: true,
      passkeySignInEnabled: true,
      idpInitiatedSsoEnabled: false,
      samlApplicationsLimit: 3,
      securityFeaturesEnabled: true,
      customDomainsLimit: 2,
    },
  };
};

const subscriptionUsage = () => ({
  quota: {
    mauLimit: 50_000,
    tokenLimit: 500_000,
    hostedEmailLimit: 100_000,
    hostedEmailDailyLimit: 10_000,
    applicationsLimit: 3,
    machineToMachineLimit: 1,
    resourcesLimit: 1,
    scopesPerResourceLimit: 1,
    socialConnectorsLimit: 3,
    userRolesLimit: 1,
    machineToMachineRolesLimit: 1,
    scopesPerRoleLimit: 1,
    hooksLimit: 1,
    auditLogsRetentionDays: 3,
    mfaEnabled: false,
    organizationsLimit: 0,
    enterpriseSsoLimit: 0,
    consoleSsoConnectorLimit: 0,
    thirdPartyApplicationsLimit: 0,
    tenantMembersLimit: 1,
    customJwtEnabled: false,
    actionsEnabled: false,
    subjectTokenEnabled: false,
    bringYourUiEnabled: false,
    collectUserProfileEnabled: false,
    passkeySignInEnabled: false,
    idpInitiatedSsoEnabled: false,
    samlApplicationsLimit: 0,
    securityFeaturesEnabled: false,
    customDomainsLimit: 1,
  },
  usage: {
    applicationsLimit: 0,
    machineToMachineLimit: 0,
    resourcesLimit: 0,
    scopesPerResourceLimit: 0,
    socialConnectorsLimit: 0,
    userRolesLimit: 0,
    machineToMachineRolesLimit: 0,
    scopesPerRoleLimit: 0,
    hooksLimit: 0,
    mfaEnabled: false,
    organizationsLimit: 0,
    enterpriseSsoLimit: 0,
    thirdPartyApplicationsLimit: 0,
    tenantMembersLimit: 0,
    customJwtEnabled: false,
    actionsEnabled: false,
    bringYourUiEnabled: false,
    collectUserProfileEnabled: false,
    passkeySignInEnabled: false,
    idpInitiatedSsoEnabled: false,
    samlApplicationsLimit: 0,
    securityFeaturesEnabled: false,
    customDomainsLimit: 0,
  },
  resources: {},
  roles: {},
});

type Handler = () => unknown;

/** Exact paths the console calls. `[^/]+` matches a tenant or member id. */
const routes: ReadonlyArray<readonly [RegExp, Handler]> = [
  // The core reads the plan quota and system limits from the subscription, so both are part of the response.
  [/^\/api\/tenants\/[^/]+\/subscription$/, () => ({ ...tenant().subscription, quota: sku().quota, systemLimit: {} })],
  [/^\/api\/tenants\/[^/]+\/subscription-usage$/, subscriptionUsage],
  [/^\/api\/tenants\/[^/]+\/available-skus$/, () => [sku(), proSku()]],
  [/^\/api\/tenants\/[^/]+\/invoices$/, () => []],
  [/^\/api\/tenants\/[^/]+\/invitations$/, () => []],
  // The console removes a tenant from its list when the member has no scopes, so the local member
  // is granted every tenant scope.
  [
    /^\/api\/tenants\/[^/]+\/members\/[^/]+\/scopes$/,
    () => Object.values(TenantScope).map((name) => ({ name })),
  ],
  [/^\/api\/skus$/, () => [sku()]],
  [/^\/api\/invitations$/, () => []],
  // Tenant settings. MFA is off until the local tenant can change it.
  [/^\/api\/tenants\/[^/]+\/settings$/, () => ({ isMfaRequired: false })],
  [
    /^\/api\/me\/regions$/,
    () => ({
      regions: [
        {
          id: 'local',
          name: 'local',
          displayName: 'Local',
          country: 'Local',
          tags: [],
          isPrivate: false,
        },
      ],
    }),
  ],
  [/^\/api\/me\/logto-enterprises$/, () => ({ logtoEnterprises: [] })],
  [/^\/api\/me\/self-hosted-licenses$/, () => []],
];

/** Whether the local cloud stand-ins apply to this instance. */
export const isLocalCloud = () => EnvSet.values.isCloud;

/**
 * Serves the local cloud API routes above, the tenant Management API under `/m/<tenant>`, and the
 * account API under `/a`. Other paths fall through to the normal routes.
 */
export const localCloudRoutes = () => {
  // The default tenant's Management API is served by this instance on its user endpoint.
  // Each tenant is served on its own host when the endpoint is domain-based (`http://*.host`), so the
  // proxy targets the tenant's host. Otherwise every tenant shares the endpoint.
  const tenantProxies = new Map<string, ReturnType<typeof proxy>>();
  const tenantProxyFor = (tenantId: string) => {
    const existing = tenantProxies.get(tenantId);

    if (existing) {
      return existing;
    }

    const created = proxy('/m', {
      target: getTenantEndpoint(tenantId, EnvSet.values).origin,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/m\/[^/]+/, ''),
    });
    tenantProxies.set(tenantId, created);

    return created;
  };

  return async (ctx: Context, next: Next) => {
    if (!isLocalCloud()) {
      return next();
    }

    if (ctx.method === 'GET') {
      const match = routes.find(([pattern]) => pattern.test(ctx.path));

      if (match) {
        ctx.body = match[1]();
        return;
      }
    }

    // Checkout: a real Stripe Checkout session in test mode when STRIPE_SECRET_KEY is set. The tenant
    // moves to production only after Stripe reports the session paid. Without the key, the local
    // stand-in below moves the tenant without a payment.
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (ctx.method === 'POST' && ctx.path === '/api/checkout-session') {
      const body = JSON.parse((await text(ctx.req)) || '{}') as {
        skuId?: string;
        tenantId?: string;
        successCallbackUrl?: string;
      };
      const tenantIdValue = body.tenantId ?? tenantId;
      const skuIdValue = body.skuId ?? ReservedPlanId.Pro202509;

      if (stripeKey) {
        const form = new URLSearchParams({
          mode: 'subscription',
          'line_items[0][price]': process.env.STRIPE_PRO_PRICE_ID ?? '',
          'line_items[0][quantity]': '1',
          success_url: body.successCallbackUrl ?? '',
          cancel_url: body.successCallbackUrl ?? '',
          client_reference_id: tenantIdValue,
          'metadata[tenantId]': tenantIdValue,
          'metadata[skuId]': skuIdValue,
        });
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        });
        const session = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };

        if (!response.ok || !session.id || !session.url) {
          ctx.status = 502;
          ctx.body = { code: 'stripe.checkout_failed', message: session.error?.message ?? 'Stripe checkout failed' };
          return;
        }

        ctx.body = { redirectUri: session.url, sessionId: session.id };
        return;
      }

      // Without Stripe, the local flip moves a tenant to production with no payment. Production must not
      // do that, so it refuses checkout until Stripe is configured.
      if (EnvSet.values.isProduction) {
        ctx.status = 503;
        ctx.body = { code: 'checkout.not_configured', message: 'Checkout is not configured.' };
        return;
      }

      const sessionId = `local_${Date.now()}`;
      localState.tag = 'production';
      localState.planId = ReservedPlanId.Pro202509;
      localState.sessions[sessionId] = { tenantId: tenantIdValue, skuId: skuIdValue };
      ctx.body = { redirectUri: body.successCallbackUrl ?? '', sessionId };
      return;
    }

    const checkoutStatus = /^\/api\/checkout-session\/([^/]+)$/.exec(ctx.path);

    if (ctx.method === 'GET' && checkoutStatus?.[1]) {
      const sessionId = checkoutStatus[1];

      if (stripeKey && sessionId.startsWith('cs_')) {
        const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        const session = (await response.json()) as {
          status?: string;
          payment_status?: string;
          metadata?: Record<string, string>;
        };
        const paid = session.status === 'complete' && ['paid', 'no_payment_required'].includes(session.payment_status ?? '');

        if (paid) {
          localState.tag = 'production';
          localState.planId = ReservedPlanId.Pro202509;
        }

        ctx.body = {
          tenantId: session.metadata?.tenantId ?? tenantId,
          skuId: session.metadata?.skuId ?? ReservedPlanId.Pro202509,
          status: paid ? 'complete' : 'open',
        };
        return;
      }

      const session = localState.sessions[sessionId];
      ctx.body = session ? { ...session, status: 'complete' } : { status: 'open' };
      return;
    }

    if (ctx.path.startsWith('/m/')) {
      const tenantId = /^\/m\/([^/]+)/.exec(ctx.path)?.[1] ?? '';

      return tenantProxyFor(tenantId)(ctx, next);
    }

    // The console reads the current user through `/a`, which maps to the account API.
    if (ctx.path === '/a' || ctx.path.startsWith('/a/')) {
      ctx.path = ctx.path.replace(/^\/a/, '/api/my-account');
    }

    return next();
  };
};
