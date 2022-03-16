import { SignInExperiences } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import {
  findDefaultSignInExperience,
  updateSignInExperienceById,
} from '@/queries/sign-in-experience';

import { AuthedRouter } from './types';

export default function signInExperiencesRoutes<T extends AuthedRouter>(router: T) {
  /**
   * As we only support single signInExperience settings for V1
   * always return the default settings in DB for the /sign-in-exp get method
   */
  router.get('/sign-in-exp', async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();
    ctx.body = signInExperience;

    return next();
  });

  // TODO: LOG-1403 need to find a way to validate SignInMethod input
  router.patch(
    '/sign-in-exp/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: SignInExperiences.createGuard.omit({ id: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      ctx.body = await updateSignInExperienceById(id, {
        ...body,
      });

      return next();
    }
  );
}
