import { sendMessagePayloadGuard } from '@logto/connector-kit';
import {
  OrganizationInvitationStatus,
  OrganizationInvitations,
  organizationInvitationEntityGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { buildManagementApiContext, truncateMembershipDelta } from '#src/libraries/hook/utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import assertThat from '#src/utils/assert-that.js';

import { errorHandler } from '../organization/utils.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function organizationInvitationRoutes<T extends ManagementApiRouter>(
  ...[
    originalRouter,
    {
      queries,
      libraries: { organizationInvitations },
    },
  ]: RouterInitArgs<T>
) {
  const { invitations } = queries.organizations;

  const router = new SchemaRouter(OrganizationInvitations, invitations, {
    errorHandler,
    disabled: {
      get: true,
      post: true,
      patchById: true,
    },
    entityGuard: organizationInvitationEntityGuard,
  });

  router.get(
    '/',
    koaGuard({
      query: z
        .object({ organizationId: z.string(), inviterId: z.string(), invitee: z.string() })
        .partial(),
      response: organizationInvitationEntityGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = await invitations.findEntities(ctx.guard.query);
      return next();
    }
  );

  router.post(
    '/',
    koaGuard({
      body: OrganizationInvitations.createGuard
        .pick({
          inviterId: true,
          invitee: true,
          organizationId: true,
          expiresAt: true,
        })
        .extend({
          invitee: z.string().email(),
          organizationRoleIds: z.string().array().optional(),
          messagePayload: sendMessagePayloadGuard.or(z.literal(false)).default(false),
        }),
      response: organizationInvitationEntityGuard,
      status: [201, 400, 422, 501],
    }),
    async (ctx, next) => {
      const {
        body: { messagePayload, ...body },
      } = ctx.guard;

      assertThat(
        body.expiresAt > Date.now(),
        new RequestError({
          code: 'request.invalid_input',
          details: 'The value of `expiresAt` must be in the future.',
        })
      );

      ctx.body = await organizationInvitations.insert(body, messagePayload, ctx.request.ip);
      ctx.status = 201;
      return next();
    }
  );

  router.post(
    '/:id/message',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: sendMessagePayloadGuard,
      status: [204],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      const { invitee, organizationId, inviterId } = await invitations.findById(id);

      const templateContext =
        await organizationInvitations.getOrganizationInvitationTemplateContext(
          organizationId,
          inviterId
        );

      await organizationInvitations.sendEmail(
        invitee,
        {
          ...templateContext,
          ...body,
        },
        ctx.request.ip
      );
      ctx.status = 204;
      return next();
    }
  );

  router.put(
    '/:id/status',
    koaGuard({
      params: z.object({
        id: z.string(),
      }),
      body: OrganizationInvitations.updateGuard
        .pick({
          acceptedUserId: true,
        })
        .extend({
          status: z.enum([
            OrganizationInvitationStatus.Accepted,
            OrganizationInvitationStatus.Revoked,
          ]),
        }),
      response: organizationInvitationEntityGuard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { status, acceptedUserId } = ctx.guard.body;

      if (status !== OrganizationInvitationStatus.Accepted) {
        ctx.body = await organizationInvitations.updateStatus(id, status);
        return next();
      }

      // TODO: Error i18n
      assertThat(
        acceptedUserId,
        new RequestError({
          status: 422,
          code: 'request.invalid_input',
          details: 'The `acceptedUserId` is required when accepting an invitation.',
        })
      );

      // Snapshot pre-existing membership only when dev features are on. In production
      // (dev-OFF) the webhook payload is the legacy `{ organizationId }`-only shape,
      // so the snapshot would be unused DB work. The snapshot must run before
      // `updateStatus` — the underlying insert uses ON CONFLICT DO NOTHING, so after
      // it runs we cannot distinguish a real addition from a re-accept of an existing
      // member. Returns the accurate `addedUserIds` for the webhook payload:
      // `[acceptedUserId]` on a real addition, `[]` on a re-accept.
      const addedUserIds = await (async (): Promise<string[]> => {
        if (!EnvSet.values.isDevFeaturesEnabled) {
          return [];
        }
        const invitation = await queries.organizations.invitations.findById(id);
        const existingUserIds = await queries.organizations.relations.users.getExistingUserIds(
          invitation.organizationId,
          [acceptedUserId]
        );
        return existingUserIds.length > 0 ? [] : [acceptedUserId];
      })();

      const result = await organizationInvitations.updateStatus(id, status, acceptedUserId);

      ctx.body = result;
      // Set explicitly so `buildManagementApiContext(ctx)` captures 200 rather than the
      // koa-default 404 in the webhook payload.
      ctx.status = 200;

      // Always emit, matching every other Organization.Membership.Updated trigger in
      // this project: the dev-features gate lives inside the spread, and
      // `truncateMembershipDelta` omits empty arrays so a re-accept (no real change)
      // produces the legacy `{ organizationId }`-only shape, identical to dev-OFF.
      const { organizationId } = result;
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId,
        ...(EnvSet.values.isDevFeaturesEnabled && truncateMembershipDelta({ addedUserIds })),
      });

      return next();
    }
  );

  originalRouter.use(router.routes());
}
