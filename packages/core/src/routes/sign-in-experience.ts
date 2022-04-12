import { SignInExperiences } from '@logto/schemas';

import { getConnectorInstances, getEnabledSocialConnectorIds } from '@/connectors';
import {
  validateBranding,
  validateTermsOfUse,
  validateSignInMethods,
  isEnabled,
} from '@/lib/sign-in-experience';
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

  router.get('/sign-in-settings', async (ctx, next) => {
    // TODO: Social Connector Details
    const signInExperience = await findDefaultSignInExperience();
    ctx.body = signInExperience;

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

      if (branding) {
        validateBranding(branding);
      }

      if (termsOfUse) {
        validateTermsOfUse(termsOfUse);
      }

      if (signInMethods) {
        // TODO: LOG-2055 refactor connectors
        const connectorInstances = await getConnectorInstances();
        const enabledConnectorInstances = connectorInstances.filter(
          (instance) => instance.connector.enabled
        );

        validateSignInMethods(signInMethods, socialSignInConnectorIds, enabledConnectorInstances);
      }

      // Update socialSignInConnectorIds only when social sign-in is enabled.
      const signInExperience =
        signInMethods && isEnabled(signInMethods.social) ? ctx.guard.body : rest;

      ctx.body = await updateDefaultSignInExperience(signInExperience);

      return next();
    }
  );
}
