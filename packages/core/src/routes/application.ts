import Router from 'koa-router';
import { nativeEnum, object, string } from 'zod';
import { ApplicationType } from '@logto/schemas';
import koaGuard from '@/middleware/koa-guard';
import koaAuth from '@/middleware/koa-auth';

export default function applicationRoutes(router: Router) {
  router.use('/application', koaAuth());
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

      ctx.body = { name, type };
      return next();
    }
  );
}
