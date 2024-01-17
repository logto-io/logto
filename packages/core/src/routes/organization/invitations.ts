import { OrganizationInvitations } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import assertThat from '#src/utils/assert-that.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationInvitationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { invitations },
      },
      libraries: { organizationInvitations },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationInvitations, invitations, {
    errorHandler,
    disabled: {
      post: true,
      patchById: true,
    },
  });

  router.post(
    '/',
    koaGuard({
      query: z.object({
        skipEmail: z.boolean().optional(),
      }),
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
        }),
      response: OrganizationInvitations.guard,
      status: [201],
    }),
    async (ctx) => {
      const { query, body } = ctx.guard;

      assertThat(
        body.expiresAt > Date.now(),
        new Error('The value of `expiresAt` must be in the future.')
      );

      ctx.body = await organizationInvitations.insert(body, query.skipEmail);
      ctx.body = 201;
    }
  );

  originalRouter.use(router.routes());
}
