import { sendMessagePayloadGuard } from '@logto/connector-kit';
import {
  OrganizationInvitationStatus,
  OrganizationInvitations,
  organizationInvitationEntityGuard,
} from '@logto/schemas';
import { isObject } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import assertThat from '#src/utils/assert-that.js';

import koaEmailI18n from '../../middleware/koa-email-i18n.js';
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

      ctx.body = await organizationInvitations.insert(body, messagePayload);
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
    koaEmailI18n(queries),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      // The `koaEmailI18n` properties are not available in the `SchemaRouter` context.
      // So we have to assert its existence here to make TypeScript happy.
      assertThat(
        'emailI18n' in ctx && isObject(ctx.emailI18n),
        new RequestError({
          status: 422,
          code: 'request.invalid_input',
          details: 'The email i18n context is missing.',
        })
      );
      const { invitee, organizationId, inviterId } = await invitations.findById(id);

      const templateContext =
        await organizationInvitations.getOrganizationInvitationTemplateContext(
          organizationId,
          inviterId
        );

      await organizationInvitations.sendEmail(invitee, {
        ...ctx.emailI18n,
        ...templateContext,
        ...body,
      });
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

      const result = await organizationInvitations.updateStatus(id, status, acceptedUserId);

      const { organizationId } = result;
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId,
      });

      ctx.body = result;

      return next();
    }
  );

  originalRouter.use(router.routes());
}
