import { RequestError, Router } from '@withtyped/server';
import { z } from 'zod';

import { invoicesResponseGuard } from './invoice.js';
import { skuGuard, skuTypeGuard } from './sku.js';
import {
  authorizeInvitee,
  authorizeOperator,
  authorizeTenantAdmin,
  type InvitationForAcceptance,
  type OperatorAuthConfig,
} from './auth.js';
import {
  acceptInvitationBodyGuard,
  createInvitationBodyGuard,
  invitationGuard,
  newInvitation,
  toInvitationView,
} from './invitation.js';

/** Stands in for an invitation that does not exist, so the caller gets the same 403 either way. */
const UNUSABLE_INVITATION: InvitationForAcceptance = {
  invitee: '',
  tokenHash: '',
  expiresAt: new Date(0),
  status: 'revoked',
};
import { type BillingStore } from './store.js';
import { subscriptionGuard } from './subscription.js';

/**
 * Billing routes served under `@meshx/cloud/routes`. Paths and response shapes match what the
 * console and core already call on the Cloud API, so they can switch imports without changes.
 */
export const createBillingRouter = (store: BillingStore, auth: OperatorAuthConfig) =>
  new Router()
    .get(
      '/api/tenants/:tenantId/subscription',
      {
        response: subscriptionGuard,
      },
      async (context, next) => {
        await authorizeOperator(context.request.headers.authorization, auth);

        const subscription = await store.findSubscription(context.guarded.params.tenantId);

        if (!subscription) {
          throw new RequestError('Subscription not found', 404);
        }

        return next({ ...context, json: subscription });
      }
    )
    .get(
      '/api/tenants/:tenantId/invoices',
      {
        response: invoicesResponseGuard,
      },
      async (context, next) => {
        await authorizeOperator(context.request.headers.authorization, auth);

        const invoices = await store.listInvoices(context.guarded.params.tenantId);

        return next({ ...context, json: { invoices } });
      }
    )
    // The public SKU catalogue: the console lists it for every signed-in user, so it has no
    // operator check. Nothing in it is tenant-specific.
    .get(
      '/api/skus',
      {
        search: z.object({ type: skuTypeGuard.optional() }),
        response: z.array(skuGuard),
      },
      async (context, next) => {
        const skus = await store.listSkus({ type: context.guarded.search.type });

        return next({ ...context, json: skus });
      }
    )
    // Tenant admins create and list invitations for their own tenant. The one-time token is returned
    // here, once, so the admin can deliver it to the invitee. Only its hash is stored.
    .post(
      '/api/tenants/:tenantId/invitations',
      {
        body: createInvitationBodyGuard,
        response: z.object({ invitation: invitationGuard, token: z.string() }),
      },
      async (context, next) => {
        const tenantId = context.guarded.params.tenantId;
        const caller = await authorizeTenantAdmin(
          context.request.headers.authorization,
          tenantId,
          auth,
          store
        );
        const { token, record } = newInvitation({
          tenantId,
          invitee: context.guarded.body.invitee,
          inviterSub: caller.sub,
        });

        await store.createInvitation(record);

        return next({ ...context, json: { invitation: toInvitationView(record), token } });
      }
    )
    .get(
      '/api/tenants/:tenantId/invitations',
      {
        response: z.object({ invitations: z.array(invitationGuard) }),
      },
      async (context, next) => {
        const tenantId = context.guarded.params.tenantId;

        await authorizeTenantAdmin(context.request.headers.authorization, tenantId, auth, store);

        const invitations = await store.listInvitations(tenantId);

        return next({ ...context, json: { invitations: invitations.map(toInvitationView) } });
      }
    )
    // The invitee accepts with the one-time token. Authentication runs first, so an unauthenticated
    // caller gets 401 whatever the invitation id. A missing or unusable invitation gets the same 403
    // as a wrong token, so the route does not reveal which invitations exist.
    .post(
      '/api/invitations/:invitationId/accept',
      {
        body: acceptInvitationBodyGuard,
        response: z.object({ invitation: invitationGuard }),
      },
      async (context, next) => {
        const invitation = await store.findInvitation(context.guarded.params.invitationId);

        await authorizeInvitee(
          context.request.headers.authorization,
          invitation ?? UNUSABLE_INVITATION,
          context.guarded.body.token,
          auth
        );

        // authorizeInvitee has already rejected a missing invitation, so this only narrows the type.
        if (!invitation) {
          throw new RequestError('Forbidden', 403);
        }

        const accepted = { ...invitation, status: 'accepted' as const };

        await store.setInvitationStatus(accepted.id, 'accepted');

        return next({ ...context, json: { invitation: toInvitationView(accepted) } });
      }
    );
