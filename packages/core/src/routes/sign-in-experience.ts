import { ConnectorType, SignInExperiences } from '@logto/schemas';

import { getLogtoConnectors } from '@/connectors';
import {
  validateBranding,
  validateTermsOfUse,
  validateSignInMethods,
  isEnabled,
  validateSignUp,
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
    ctx.body = await findDefaultSignInExperience();

    return next();
  });

  router.patch(
    '/sign-in-exp',
    koaGuard({
      body: SignInExperiences.createGuard.omit({ id: true }).partial(),
    }),
    async (ctx, next) => {
      const { socialSignInConnectorTargets, ...rest } = ctx.guard.body;
      const { branding, termsOfUse, signInMethods, signUp } = rest;

      if (branding) {
        validateBranding(branding);
      }

      if (termsOfUse) {
        validateTermsOfUse(termsOfUse);
      }

      const connectors = await getLogtoConnectors();
      const enabledConnectors = connectors.filter(({ dbEntry: { enabled } }) => enabled);

      // Remove unavailable connectors
      const filteredSocialSignInConnectorTargets = socialSignInConnectorTargets?.filter((target) =>
        enabledConnectors.some(
          (connector) =>
            connector.metadata.target === target && connector.type === ConnectorType.Social
        )
      );

      if (signInMethods) {
        validateSignInMethods(
          signInMethods,
          filteredSocialSignInConnectorTargets,
          enabledConnectors
        );
      }

      if (signUp) {
        validateSignUp(signUp, enabledConnectors);
      }

      // Update socialSignInConnectorTargets only when social sign-in is enabled.
      const signInExperience =
        signInMethods && isEnabled(signInMethods.social)
          ? {
              ...ctx.guard.body,
              socialSignInConnectorTargets: filteredSocialSignInConnectorTargets,
            }
          : rest;

      ctx.body = await updateDefaultSignInExperience(signInExperience);

      return next();
    }
  );
}
