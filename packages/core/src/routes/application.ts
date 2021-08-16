import Router from 'koa-router';
import { nativeEnum, object, string } from 'zod';
import { ApplicationType } from '@logto/schemas';
import koaGuard from '@/middleware/koa-guard';

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

      ctx.body = { name, type };
      return next();
    }
  );
}
