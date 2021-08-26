import Router from 'koa-router';
import { nativeEnum, object, string } from 'zod';
import { ApplicationType } from '@logto/schemas';
import koaGuard from '@/middleware/koa-guard';
import { deleteApplicationById, insertApplication } from '@/queries/application';
import { buildIdGenerator } from '@/utils/id';
import { generateOidcClientMetadata } from '@/oidc/utils';

const applicationId = buildIdGenerator(21);

export default function applicationRoutes<StateT, ContextT>(router: Router<StateT, ContextT>) {
  router.post(
    '/application',
    koaGuard({
      body: object({
        name: string().min(1),
        type: nativeEnum(ApplicationType),
      }),
    }),
    async (ctx, next) => {
      const { name, type } = ctx.guard.body;

      ctx.body = await insertApplication({
        id: applicationId(),
        type,
        name,
        oidcClientMetadata: generateOidcClientMetadata(),
      });
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
