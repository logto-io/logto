import { SignInExperiences } from '@logto/schemas';

import { getEnabledSocialConnectorIds } from '@/connectors';
import { validateBranding, validateTermsOfUse } from '@/lib/sign-in-experience';
import koaGuard from '@/middleware/koa-guard';
import {
  findDefaultSignInExperience,
  updateDefaultSignInExperience,
} from '@/queries/sign-in-experience';

import { AuthedRouter } from './types';

export default function signInExperiencesRoutes<T extends AuthedRouter>(router: T) {
  /**
   * As we only support single signInExperience settings for V1
   * always return the default settings in DB for the /sign-in-exp get method
   */
  router.get('/sign-in-exp', async (ctx, next) => {
    const [signInExperience, enabledSocialConnectorIds] = await Promise.all([
      findDefaultSignInExperience(),
      getEnabledSocialConnectorIds(),
    ]);

    const { socialSignInConnectorIds: selectedSocialSignInConnectorIds } = signInExperience;
    const enabledSocialConnectorIdSet = new Set(enabledSocialConnectorIds);

    const socialSignInConnectorIds = selectedSocialSignInConnectorIds.filter((id) =>
      enabledSocialConnectorIdSet.has(id)
    );

    ctx.body = {
      ...signInExperience,
      socialSignInConnectorIds,
    };

    return next();
  });

  router.patch(
    '/sign-in-exp',
    koaGuard({
      body: SignInExperiences.createGuard.omit({ id: true }).partial(),
    }),
    async (ctx, next) => {
      const { branding, termsOfUse } = ctx.guard.body;

      if (branding) {
        validateBranding(branding);
      }

      if (termsOfUse) {
        validateTermsOfUse(termsOfUse);
      }

      // TODO: validate SignInMethods
      // TODO: validate socialConnectorIds

      // TODO: Only update socialSignInConnectorIds when social sign-in is enabled.
      ctx.body = await updateDefaultSignInExperience({
        ...ctx.guard.body,
      });

      return next();
    }
  );
}
