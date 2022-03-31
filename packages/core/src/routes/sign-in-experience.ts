import { SignInExperiences } from '@logto/schemas';

import { getEnabledSocialConnectorIds } from '@/connectors';
import koaGuard from '@/middleware/koa-guard';
import {
  findDefaultSignInExperience,
  updateDefaultSignInExperience,
} from '@/queries/sign-in-experience';
import { isEnabled } from '@/utils/assert-sign-in-experience';
import {
  validateBranding,
  validateSignInMethods,
  validateTermsOfUse,
} from '@/utils/validate-sign-in-experience';

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
      const { socialSignInConnectorIds, ...rest } = ctx.guard.body;
      const { branding, termsOfUse, signInMethods } = rest;

      validateBranding(branding);
      validateTermsOfUse(termsOfUse);
      await validateSignInMethods(signInMethods, socialSignInConnectorIds);

      // Only update socialSignInConnectorIds when social sign-in is enabled.
      const signInExperience =
        signInMethods && isEnabled(signInMethods.social)
          ? { ...rest, socialSignInConnectorIds }
          : { ...rest };

      ctx.body = await updateDefaultSignInExperience(signInExperience);

      return next();
    }
  );
}
