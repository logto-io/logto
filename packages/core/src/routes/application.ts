import { Applications } from '@logto/schemas';
import Router from 'koa-router';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import { generateOidcClientMetadata } from '@/oidc/utils';
import {
  deleteApplicationById,
  insertApplication,
  updateApplicationById,
} from '@/queries/application';
import { buildIdGenerator } from '@/utils/id';

const applicationId = buildIdGenerator(21);

export default function applicationRoutes<StateT, ContextT>(router: Router<StateT, ContextT>) {
  router.post(
    '/application',
    koaGuard({
      body: Applications.guard
        .omit({ id: true, createdAt: true })
        .partial()
        .merge(Applications.guard.pick({ name: true, type: true })),
    }),
    async (ctx, next) => {
      const { name, type, ...rest } = ctx.guard.body;

      ctx.body = await insertApplication({
        id: applicationId(),
        type,
        name,
        oidcClientMetadata: generateOidcClientMetadata(),
        ...rest,
      });
      return next();
    }
  );

  router.patch(
    '/application/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      // Consider `.deepPartial()` if OIDC client metadata bloats
      body: Applications.guard.omit({ id: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      ctx.body = await updateApplicationById(id, body);
      return next();
    }
  );

  router.delete(
    '/application/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      // Note: will need delete cascade when application is joint with other tables
      await deleteApplicationById(id);
      ctx.status = 204;
      return next();
    }
  );
}
