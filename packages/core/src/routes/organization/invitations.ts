import { OrganizationInvitations, organizationInvitationEntityGuard } from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
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
    entityGuard: organizationInvitationEntityGuard,
  });

  router.post(
    '/',
    koaGuard({
      query: z.object({
        skipEmail: z.string().optional(),
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
      response: organizationInvitationEntityGuard,
      status: [201],
    }),
    async (ctx) => {
      const { query, body } = ctx.guard;

      assertThat(
        body.expiresAt > Date.now(),
        new RequestError({
          code: 'request.invalid_input',
          details: 'The value of `expiresAt` must be in the future.',
        })
      );

      ctx.body = await organizationInvitations.insert(body, yes(query.skipEmail));
      ctx.status = 201;
    }
  );

  originalRouter.use(router.routes());
}
